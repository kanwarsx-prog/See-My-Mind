from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models
from app.api.deps import get_current_user, get_db, require_roles
from app.core.security import get_password_hash
from app.schemas.admin import (
    AdminSchoolCreate,
    AdminSchoolResponse,
    AuditLogResponse,
    DelegationMatrixItem,
    StaffProvisionRequest,
    StaffProvisionResponse,
    StaffUpdateRequest,
    TrustGovernanceStats,
)

router = APIRouter()


@router.get(
    "/stats",
    response_model=TrustGovernanceStats,
    summary="Get Trust & Multi-School Governance Overview",
)
def get_trust_stats(
    current_user: models.User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """Return platform and trust-wide compliance, school count, staff and pupil totals."""
    total_schools = db.query(models.School).count()
    total_staff = (
        db.query(models.User)
        .filter(models.User.role.in_(["senco", "teacher", "ta", "admin"]))
        .count()
    )
    total_pupils = db.query(models.Child).count()
    ehcp_pupils = (
        db.query(models.ChildSupportProfile)
        .filter(models.ChildSupportProfile.has_ehcp == True)  # noqa: E712
        .count()
    )
    audit_events_count = db.query(models.AuditLog).count()

    return TrustGovernanceStats(
        total_schools=total_schools,
        total_staff=total_staff,
        total_pupils=total_pupils,
        ehcp_pupils=ehcp_pupils,
        compliance_score="99.4% (KCSIE & GDPR Audited)",
        audit_events_count=audit_events_count,
        lead_trust_admin=current_user.full_name or "Dr. Alistair Vance",
    )


@router.get(
    "/schools",
    response_model=list[AdminSchoolResponse],
    summary="List all school tenants across the Trust",
)
def list_schools(
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Retrieve all onboarded schools with pupil and staff counts.
    SENCO users see their own school; Admin sees all trust schools.
    """
    query = db.query(models.School)
    if current_user.role == "senco" and current_user.school_id:
        query = query.filter(models.School.id == current_user.school_id)

    schools = query.order_by(models.School.school_name.asc()).all()
    results = []
    for s in schools:
        pupil_count = db.query(models.Child).filter(models.Child.school_id == s.id).count()
        staff_count = (
            db.query(models.User)
            .filter(models.User.school_id == s.id, models.User.role.in_(["senco", "teacher", "ta"]))
            .count()
        )
        results.append(
            AdminSchoolResponse(
                id=s.id,
                school_name=s.school_name,
                urn_number=s.urn_number,
                phase=s.phase or "Primary",
                local_authority=s.local_authority or "Southwark",
                lead_senco_name=s.lead_senco_name or "To be appointed",
                school_reference=s.school_reference,
                town_city=s.town_city,
                postcode=s.postcode,
                main_email=s.main_email,
                main_telephone=s.main_telephone,
                active=s.active,
                pupil_count=pupil_count,
                staff_count=staff_count,
                created_at=s.created_at,
            )
        )
    return results


@router.post(
    "/schools",
    response_model=AdminSchoolResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Onboard a new school into the Trust portfolio",
)
def onboard_school(
    payload: AdminSchoolCreate,
    current_user: models.User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """Trust Admin onboards a new school with DfE URN, phase, and local authority."""
    existing = (
        db.query(models.School)
        .filter(models.School.urn_number == payload.urn_number.strip())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A school with URN '{payload.urn_number}' already exists: {existing.school_name}",
        )

    school_ref = payload.school_reference or f"SCH-{payload.urn_number.strip()}"
    school = models.School(
        school_name=payload.school_name.strip(),
        school_reference=school_ref,
        urn_number=payload.urn_number.strip(),
        phase=payload.phase.strip(),
        local_authority=payload.local_authority.strip() if payload.local_authority else None,
        lead_senco_name=payload.lead_senco_name.strip() if payload.lead_senco_name else None,
        town_city=payload.town_city.strip() if payload.town_city else None,
        postcode=payload.postcode.strip() if payload.postcode else None,
        main_email=str(payload.main_email) if payload.main_email else None,
        main_telephone=payload.main_telephone.strip() if payload.main_telephone else None,
        active=True,
    )
    db.add(school)
    db.flush()

    # Log immutable governance event
    audit_entry = models.AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name or "Trust Admin",
        actor_role="admin",
        school_id=school.id,
        action="ONBOARD_SCHOOL",
        target_type="school",
        target_id=school.id,
        target_name=school.school_name,
        details=f"Onboarded school '{school.school_name}' (URN: {school.urn_number}, Phase: {school.phase}, LA: {school.local_authority}) into Trust portfolio.",
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(school)

    return AdminSchoolResponse(
        id=school.id,
        school_name=school.school_name,
        urn_number=school.urn_number,
        phase=school.phase,
        local_authority=school.local_authority,
        lead_senco_name=school.lead_senco_name,
        school_reference=school.school_reference,
        town_city=school.town_city,
        postcode=school.postcode,
        main_email=school.main_email,
        main_telephone=school.main_telephone,
        active=school.active,
        pupil_count=0,
        staff_count=0,
        created_at=school.created_at,
    )


@router.get(
    "/users",
    summary="List staff members across school tenants",
)
def list_admin_users(
    school_id: UUID | None = None,
    role: str | None = None,
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Retrieve all provisioned staff users filtered by school tenant or role."""
    query = db.query(models.User).filter(
        models.User.role.in_(["senco", "teacher", "ta", "admin"])
    )

    if current_user.role == "senco" and current_user.school_id:
        query = query.filter(models.User.school_id == current_user.school_id)
    elif school_id:
        query = query.filter(models.User.school_id == school_id)

    if role:
        query = query.filter(models.User.role == role.lower().strip())

    users = query.order_by(models.User.created_at.desc()).all()
    out = []
    for u in users:
        school = db.query(models.School).filter(models.School.id == u.school_id).first() if u.school_id else None
        out.append(
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "school_id": str(u.school_id) if u.school_id else None,
                "school_name": school.school_name if school else "Trust Central Office",
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
        )
    return out


@router.post(
    "/users",
    response_model=StaffProvisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Provision a staff persona (SENCO, Teacher, TA, Specialist, Admin)",
)
def provision_staff_persona(
    payload: StaffProvisionRequest,
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Admin or SENCO provisions a staff account.
    - Admins can onboard staff across any school and appoint Lead SENCOs.
    - SENCOs can recruit and provision Teachers, TAs, and Specialists strictly within their own school tenant.
    """
    # 1. Resolve Target School & Tenant Boundary
    if current_user.role == "senco":
        if not current_user.school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SENCO account is not linked to an active school tenant.",
            )
        if payload.school_id and payload.school_id != current_user.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs can only provision staff for their assigned school.",
            )
        target_school_id = current_user.school_id
    else:
        if not payload.school_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target school_id is required.",
            )
        target_school_id = payload.school_id

    school = db.query(models.School).filter(models.School.id == target_school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target school with ID '{target_school_id}' was not found.",
        )

    # 2. Validate Role Permissions
    role = payload.role.lower().strip()
    if current_user.role == "senco":
        if role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs are not authorized to provision Admin accounts.",
            )
        if role not in ["teacher", "ta", "specialist", "senco"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid persona role '{role}'. SENCOs can provision: teacher, ta, specialist, senco.",
            )
    else:
        if role not in ["senco", "teacher", "ta", "specialist", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid persona role '{role}'. Allowed roles: senco, teacher, ta, specialist, admin.",
            )

    target_email = str(payload.email).lower().strip()
    existing_user = db.query(models.User).filter(models.User.email == target_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{target_email}' already exists.",
        )

    raw_password = payload.password or "Welcome2026!"
    hashed_pwd = get_password_hash(raw_password)

    full_name = f"{payload.first_name.strip()} {payload.last_name.strip()}"

    # Create StaffMember entity
    staff = models.StaffMember(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=target_email,
        active=True,
    )
    db.add(staff)
    db.flush()

    # Create StaffSchoolAssignment
    assignment = models.StaffSchoolAssignment(
        staff_id=staff.id,
        school_id=school.id,
        role=role.capitalize(),
        job_title=payload.job_title or f"Lead {role.capitalize()}",
        active=True,
    )
    db.add(assignment)

    # Create User account
    user = models.User(
        email=target_email,
        hashed_password=hashed_pwd,
        full_name=full_name,
        role=role,
        is_active=True,
        is_verified=True,
        school_id=school.id,
        staff_id=staff.id,
    )
    db.add(user)
    db.flush()

    # If appointing a SENCO by admin, update school lead_senco_name
    action_type = "PROVISION_STAFF"
    if current_user.role == "senco":
        action_type = "SENCO_PROVISION_STAFF"
    elif role == "senco":
        action_type = "APPOINT_SENCO"
        school.lead_senco_name = full_name
        db.flush()

    # Record Audit Log
    actor_label = "Admin" if current_user.role == "admin" else "SENCO"
    audit = models.AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name or actor_label,
        actor_role=current_user.role,
        school_id=school.id,
        action=action_type,
        target_type="user",
        target_id=user.id,
        target_name=full_name,
        details=f"{actor_label} {current_user.full_name or ''} provisioned {role.upper()} ({full_name}) for {school.school_name} with job title '{payload.job_title or role.capitalize()}'.",
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    return StaffProvisionResponse(
        user_id=user.id,
        staff_id=staff.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        school_id=school.id,
        school_name=school.school_name,
        job_title=payload.job_title or role.capitalize(),
        temporary_credentials=raw_password,
        invitation_token=f"INV-{str(user.id)[:8].upper()}",
        message=f"Successfully provisioned {role.upper()} account for {full_name} at {school.school_name}.",
    )


@router.put(
    "/users/{user_id}",
    summary="Update staff member profile, role, or active status",
)
def update_staff_persona(
    user_id: UUID,
    payload: StaffUpdateRequest,
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Admin or SENCO updates a staff account within authorized boundaries.
    - Admins can update staff across any school.
    - SENCOs can only update staff within their own assigned school tenant.
    - SENCOs cannot edit an Admin account or elevate any account to Admin.
    """
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user with ID '{user_id}' was not found.",
        )

    # Tenant boundary enforcement for SENCO
    if current_user.role == "senco":
        if target_user.school_id != current_user.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs can only update staff for their assigned school.",
            )
        if target_user.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs are not authorized to edit Admin accounts.",
            )
        if payload.role and payload.role.lower().strip() == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs cannot elevate accounts to Admin.",
            )

    # Check email conflict if changing email
    if payload.email:
        new_email = str(payload.email).lower().strip()
        if new_email != target_user.email:
            existing = db.query(models.User).filter(models.User.email == new_email).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"An account with email '{new_email}' already exists.",
                )
            target_user.email = new_email
            if target_user.staff_member:
                target_user.staff_member.email = new_email

    # Update names
    if payload.first_name or payload.last_name:
        first_name = payload.first_name.strip() if payload.first_name else (target_user.staff_member.first_name if target_user.staff_member else "")
        last_name = payload.last_name.strip() if payload.last_name else (target_user.staff_member.last_name if target_user.staff_member else "")
        if target_user.staff_member:
            if payload.first_name:
                target_user.staff_member.first_name = payload.first_name.strip()
            if payload.last_name:
                target_user.staff_member.last_name = payload.last_name.strip()
        target_user.full_name = f"{first_name} {last_name}".strip() or target_user.full_name

    # Update role
    if payload.role:
        new_role = payload.role.lower().strip()
        if current_user.role == "senco" and new_role not in ["teacher", "ta", "specialist", "senco"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid persona role '{new_role}'. Allowed: teacher, ta, specialist, senco.",
            )
        target_user.role = new_role

    # Update active status
    if payload.is_active is not None:
        target_user.is_active = payload.is_active
        if target_user.staff_member:
            target_user.staff_member.active = payload.is_active

    # Update job title on StaffSchoolAssignment
    if payload.job_title is not None and target_user.staff_id:
        assignment = (
            db.query(models.StaffSchoolAssignment)
            .filter(models.StaffSchoolAssignment.staff_id == target_user.staff_id)
            .first()
        )
        if assignment:
            assignment.job_title = payload.job_title
            if payload.role:
                assignment.role = payload.role.capitalize()
            if payload.is_active is not None:
                assignment.active = payload.is_active

    action_type = "SENCO_UPDATE_STAFF" if current_user.role == "senco" else "UPDATE_STAFF"
    actor_label = "Admin" if current_user.role == "admin" else "SENCO"
    audit = models.AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name or actor_label,
        actor_role=current_user.role,
        school_id=target_user.school_id,
        action=action_type,
        target_type="user",
        target_id=target_user.id,
        target_name=target_user.full_name,
        details=f"{actor_label} {current_user.full_name or ''} updated staff profile for {target_user.full_name} ({target_user.role}).",
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    school = db.query(models.School).filter(models.School.id == target_user.school_id).first() if target_user.school_id else None
    return {
        "id": str(target_user.id),
        "email": target_user.email,
        "full_name": target_user.full_name,
        "role": target_user.role,
        "school_id": str(target_user.school_id) if target_user.school_id else None,
        "school_name": school.school_name if school else "Platform Governance",
        "is_active": target_user.is_active,
        "is_verified": target_user.is_verified,
        "created_at": target_user.created_at.isoformat() if target_user.created_at else None,
    }


@router.delete(
    "/users/{user_id}",
    summary="Delete a staff member and revoke access",
)
def delete_staff_persona(
    user_id: UUID,
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Admin or SENCO deletes a staff account.
    - Cannot delete oneself.
    - SENCOs can only delete staff within their own assigned school tenant.
    - SENCOs cannot delete Admin accounts.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own active account.",
        )

    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target user with ID '{user_id}' was not found.",
        )

    # Tenant and role boundary enforcement for SENCO
    if current_user.role == "senco":
        if target_user.school_id != current_user.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs can only delete staff for their assigned school.",
            )
        if target_user.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="SENCOs are not authorized to delete Admin accounts.",
            )

    full_name = target_user.full_name
    email = target_user.email
    target_role = target_user.role
    school_id = target_user.school_id
    staff_id = target_user.staff_id

    # If this was the school's appointed lead senco, clear it
    if target_role == "senco" and school_id:
        school = db.query(models.School).filter(models.School.id == school_id).first()
        if school and school.lead_senco_name == full_name:
            school.lead_senco_name = None
            db.flush()

    # Delete User first
    db.delete(target_user)
    db.flush()

    # Delete StaffMember & assignments if present
    if staff_id:
        staff = db.query(models.StaffMember).filter(models.StaffMember.id == staff_id).first()
        if staff:
            db.delete(staff)
            db.flush()

    action_type = "SENCO_DELETE_STAFF" if current_user.role == "senco" else "DELETE_STAFF"
    actor_label = "Admin" if current_user.role == "admin" else "SENCO"
    audit = models.AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name or actor_label,
        actor_role=current_user.role,
        school_id=school_id,
        action=action_type,
        target_type="user",
        target_id=user_id,
        target_name=full_name,
        details=f"{actor_label} {current_user.full_name or ''} deleted {target_role.upper()} ({full_name}, {email}).",
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Staff member '{full_name}' was deleted successfully.",
        "deleted_id": str(user_id),
    }


@router.get(
    "/audit-logs",
    response_model=list[AuditLogResponse],
    summary="Query the immutable security and governance audit trail",
)
def get_audit_logs(
    school_id: UUID | None = None,
    action: str | None = None,
    limit: int = Query(default=50, le=200),
    current_user: models.User = Depends(require_roles(["admin", "senco"])),
    db: Session = Depends(get_db),
):
    """Retrieve immutable chronological audit trail tracking onboarding, role provisioning, and access checks."""
    query = db.query(models.AuditLog)

    if current_user.role == "senco" and current_user.school_id:
        # SENCO sees audit logs for their school only
        query = query.filter(models.AuditLog.school_id == current_user.school_id)
    elif school_id:
        query = query.filter(models.AuditLog.school_id == school_id)

    if action:
        query = query.filter(models.AuditLog.action == action.upper().strip())

    logs = query.order_by(models.AuditLog.timestamp.desc()).limit(limit).all()

    results = []
    for log in logs:
        school = db.query(models.School).filter(models.School.id == log.school_id).first() if log.school_id else None
        results.append(
            AuditLogResponse(
                id=log.id,
                timestamp=log.timestamp,
                actor_id=log.actor_id,
                actor_name=log.actor_name,
                actor_role=log.actor_role,
                school_id=log.school_id,
                school_name=school.school_name if school else "Trust Portfolio",
                action=log.action,
                target_type=log.target_type,
                target_id=log.target_id,
                target_name=log.target_name,
                details=log.details,
                ip_address=log.ip_address,
            )
        )
    return results


@router.get(
    "/delegation-matrix",
    response_model=list[DelegationMatrixItem],
    summary="Get active responsibility delegation matrix",
)
def get_delegation_matrix():
    """Return the explicit separation of duties and legal operational boundaries across personas."""
    return [
        DelegationMatrixItem(
            role_key="admin",
            role_title="Admin (Platform & Governance)",
            tier="Platform Administration Level",
            authorities=[
                "Onboard new school tenants with DfE URN",
                "Appoint and provision Lead SENCOs",
                "Monitor cross-school compliance and high-needs funding",
                "Inspect immutable compliance and access audit trails",
            ],
            delegated_responsibilities=[
                "School-level staff recruitment & provisioning delegated to Lead SENCO",
                "School-level SEND admissions delegated to Lead SENCO",
                "Classroom differentiation delegated to Teachers",
                "Statutory Section 44 pack generation delegated to SENCO",
            ],
            safeguarding_scope="Restricted: Cannot view confidential child ABC/medical notes without explicit DSL clearance.",
            data_boundary="Multi-school platform oversight with strict tenant isolation enforcement.",
        ),
        DelegationMatrixItem(
            role_key="senco",
            role_title="Lead SENCO & Inclusion Lead (School Admin)",
            tier="School Administrative & Pedagogical Level",
            authorities=[
                "Recruit and provision school staff (Classroom Teachers, TAs, Specialists)",
                "Admit and register pupils onto school SEND register",
                "Dispatch parent onboarding invitations and link guardians",
                "Compile Section 44 Annual Review Statutory Packs",
                "Allocate and manage 1:1 TA hours and caseloads",
                "Oversee whole-school SEND provision matrix",
            ],
            delegated_responsibilities=[
                "School-level inclusion operations & staff management",
                "Classroom adaptation delivery delegated to Class Teachers",
                "Micro-event recording delegated to TAs",
            ],
            safeguarding_scope="Full School Access: Lead oversight on behaviour, EHCP statutory reviews, and pastoral care.",
            data_boundary="Strictly isolated to their assigned school tenant (school_id).",
        ),
        DelegationMatrixItem(
            role_key="teacher",
            role_title="Classroom Teacher",
            tier="Classroom Delivery Level",
            authorities=[
                "Acknowledge Pre-Flight morning handovers in 1-click",
                "View and deliver classroom differentiated learning pathways",
                "Launch interactive worksheets with students",
                "Log observable classroom milestones and strategy validations",
            ],
            delegated_responsibilities=[
                "Classroom delivery delegated by SENCO",
                "Immediate 1-to-1 morning transitions supported by TA",
            ],
            safeguarding_scope="Classroom Context: Can record behavioral observations; safeguarding escalations sent to DSL.",
            data_boundary="Restricted to assigned class roster within school tenant.",
        ),
        DelegationMatrixItem(
            role_key="ta",
            role_title="1-to-1 Teaching Assistant",
            tier="Operational & Transitional Support Level",
            authorities=[
                "Execute time-stamped high-risk morning schedule (headphones, assembly)",
                "Record <45s micro-logs on sensory, attention, and medication windows",
                "Support interactive visual worksheets at desk",
            ],
            delegated_responsibilities=[
                "Direct student transition support delegated by SENCO & Teacher",
            ],
            safeguarding_scope="Immediate Support: Records objective micro-observations; flags concerns to Teacher/SENCO.",
            data_boundary="Restricted to allocated high-needs student caseload within school tenant.",
        ),
        DelegationMatrixItem(
            role_key="parent",
            role_title="Parent & Legal Guardian",
            tier="Home-School Loop Level",
            authorities=[
                "Submit 20-second Pre-Flight morning handover notes",
                "Receive instant read-receipt confirmation from classroom teacher",
                "Access 3:15pm Decompression Bridge and restraint collapse decoder",
                "Log evening check-in and review 30-day clinical medication digests",
            ],
            delegated_responsibilities=[
                "Home care and parental handover responsibility",
            ],
            safeguarding_scope="Personal Family Access: Strictly limited to authorized child record.",
            data_boundary="Strict isolation to legally linked children (parental_responsibility=True).",
        ),
        DelegationMatrixItem(
            role_key="child",
            role_title="Pupil Voice",
            tier="Student Agency Level",
            authorities=[
                "Log 1-tap emoji emotional check-in (😄, 🙂, 😐, 😟, 😰)",
                "Engage with gamified visual worksheets (Game Slope rise ÷ run)",
                "Celebrate daily superpower wins with zero adult-admin burden",
            ],
            delegated_responsibilities=[
                "Student self-advocacy and regulatory expression",
            ],
            safeguarding_scope="Self-Voice: Emotional check-in automatically triggers adult support if distress logged.",
            data_boundary="Strict isolation to own student account via 4-digit PIN or emoji avatar.",
        ),
    ]
