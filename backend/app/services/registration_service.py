from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session

from app import models
from app.core.security import generate_invitation_token, get_password_hash
from app.schemas.registration import (
    ChildRegistrationRequest,
    ChildRegistrationResponse,
    InvitationValidationResponse,
)
from app.services.email_service import EmailService


class RegistrationService:
    @staticmethod
    def register_child(
        db: Session,
        reg_data: ChildRegistrationRequest,
        created_by_senco_name: str = "Amara Okafor (SENCO)",
    ) -> ChildRegistrationResponse:
        """Register a new pupil on the SEND register, configure support profile,
        link guardian, and dispatch onboarding invitation.
        """
        # 1. Resolve school
        school = None
        if reg_data.school_id:
            school = db.query(models.School).filter(models.School.id == reg_data.school_id).first()
        if not school:
            school = db.query(models.School).first()
        if not school:
            school = models.School(
                school_name="St. Jude's Inclusive Academy",
                school_reference="SCH-STJUDES",
                town_city="London",
                postcode="SE1 7PB",
                main_email="admin@stjudes.sch.uk",
            )
            db.add(school)
            db.flush()

        # 2. Create Child record
        full_name = f"{reg_data.first_name} {reg_data.last_name}"
        child = models.Child(
            first_name=reg_data.first_name,
            last_name=reg_data.last_name,
            full_name=full_name,
            preferred_name=reg_data.preferred_name or reg_data.first_name,
            date_of_birth=reg_data.date_of_birth,
            sex=reg_data.sex,
            year_group=reg_data.year_group,
            school_id=school.id,
            active=True,
        )
        db.add(child)
        db.flush()

        # 3. Create Support Profile
        profile_summary = (
            reg_data.summary
            or f"{child.first_name} was registered by {created_by_senco_name} on {datetime.now(UTC).strftime('%d %B %Y')}. Primary need: {reg_data.primary_need}."
        )
        profile = models.ChildSupportProfile(
            child_id=child.id,
            primary_need=reg_data.primary_need,
            secondary_need=reg_data.secondary_need,
            summary=profile_summary,
            communication_preferences=reg_data.communication_preferences,
            sensory_profile=reg_data.sensory_profile,
            strengths_interests=reg_data.strengths_interests,
            has_ehcp=reg_data.has_ehcp,
        )
        db.add(profile)
        db.flush()

        # Optional baseline strategy
        if reg_data.baseline_strategy:
            strategy = models.ChildSupportStrategy(
                profile_id=profile.id,
                custom_title=reg_data.baseline_strategy,
                custom_instructions="Approved baseline strategy on registration.",
                priority=1,
                effective_rating="Effective",
            )
            db.add(strategy)

        # 4. Find or Create Guardian
        guardian = (
            db.query(models.Guardian)
            .filter(models.Guardian.email == reg_data.guardian_email.lower())
            .first()
        )
        if not guardian:
            guardian = models.Guardian(
                first_name=reg_data.guardian_first_name,
                last_name=reg_data.guardian_last_name,
                email=reg_data.guardian_email.lower(),
                mobile_phone=reg_data.guardian_mobile,
                relationship_to_child=reg_data.relationship_to_child,
                active=True,
            )
            db.add(guardian)
            db.flush()

        # 5. Link Guardian to Child
        guardian_link = models.ChildGuardianLink(
            child_id=child.id,
            guardian_id=guardian.id,
            parental_responsibility=True,
            emergency_contact=True,
            primary_carer=True,
            receive_daily_updates=True,
        )
        db.add(guardian_link)
        db.flush()

        # 6. System Timeline Event
        onboarding_event = models.ChildEvent(
            child_id=child.id,
            school_id=school.id,
            event_type="Milestone",
            reporter_type="SENCO",
            reporter_name=created_by_senco_name,
            title=f"SEND Pupil Registered ({child.year_group})",
            summary=f"{child.full_name} added to St. Jude's SEND register by {created_by_senco_name}. Primary need: {reg_data.primary_need}. Parent link: {guardian.first_name} {guardian.last_name}.",
            significance="Notable Win",
            visibility="Shared",
            status="Active",
        )
        db.add(onboarding_event)

        # 7. Generate Invitation & Email
        invitation = None
        invitation_url = None
        email_preview = None

        if reg_data.send_invitation_immediately:
            token = generate_invitation_token()
            expires_at = datetime.now(UTC) + timedelta(days=3)

            invitation = models.Invitation(
                email=guardian.email,
                token=token,
                role="parent",
                child_id=child.id,
                school_id=school.id,
                status="pending",
                expires_at=expires_at,
            )
            db.add(invitation)
            db.flush()

            # Dispatch email & capture preview
            email_preview = EmailService.send_parent_invitation(
                to_email=guardian.email,
                parent_name=guardian.first_name,
                child_name=child.first_name,
                school_name=school.school_name,
                token=token,
            )
            invitation_url = email_preview.activation_url

        db.commit()
        db.refresh(child)

        return ChildRegistrationResponse(
            child_id=child.id,
            full_name=child.full_name,
            school_id=school.id,
            guardian_id=guardian.id,
            invitation_id=invitation.id if invitation else None,
            invitation_token=invitation.token if invitation else None,
            invitation_url=invitation_url,
            email_preview=email_preview,
            message=f"Pupil {child.full_name} registered successfully. Parent invitation sent to {guardian.email}.",
        )

    @staticmethod
    def validate_invitation(db: Session, token: str) -> InvitationValidationResponse:
        """Validate an onboarding token."""
        inv = db.query(models.Invitation).filter(models.Invitation.token == token).first()
        if not inv:
            return InvitationValidationResponse(token=token, valid=False, recipient_email="")

        if inv.status != "pending":
            return InvitationValidationResponse(
                token=token,
                valid=False,
                recipient_email=inv.email,
                role=inv.role,
                child_id=inv.child_id,
            )

        # Check expiry
        now = datetime.now(UTC)
        exp = inv.expires_at if inv.expires_at.tzinfo else inv.expires_at.replace(tzinfo=UTC)
        if exp < now:
            inv.status = "expired"
            db.commit()
            return InvitationValidationResponse(
                token=token,
                valid=False,
                recipient_email=inv.email,
                role=inv.role,
                child_id=inv.child_id,
            )

        child = db.query(models.Child).filter(models.Child.id == inv.child_id).first()
        school = db.query(models.School).filter(models.School.id == inv.school_id).first()

        return InvitationValidationResponse(
            token=token,
            valid=True,
            recipient_email=inv.email,
            child_id=inv.child_id,
            child_name=child.full_name if child else "Your Child",
            school_name=school.school_name if school else "St. Jude's Academy",
            role=inv.role,
            expires_at=inv.expires_at,
        )

    @staticmethod
    def accept_invitation(
        db: Session, token: str, password: str, full_name: str | None = None
    ) -> models.User:
        """Parent accepts invitation, sets up secure password, and activates portal account."""
        inv = db.query(models.Invitation).filter(models.Invitation.token == token).first()
        if not inv or inv.status != "pending":
            raise ValueError("Invalid or expired invitation token.")

        now = datetime.now(UTC)
        exp = inv.expires_at if inv.expires_at.tzinfo else inv.expires_at.replace(tzinfo=UTC)
        if exp < now:
            inv.status = "expired"
            db.commit()
            raise ValueError("This invitation link has expired. Please request a new invite.")

        # Check if user already exists
        user = db.query(models.User).filter(models.User.email == inv.email.lower()).first()
        if user:
            user.hashed_password = get_password_hash(password)
            user.is_active = True
            user.is_verified = True
            if full_name:
                user.full_name = full_name
            if not user.child_id and inv.child_id:
                user.child_id = inv.child_id
        else:
            # Find guardian record if available
            guardian = (
                db.query(models.Guardian)
                .filter(models.Guardian.email == inv.email.lower())
                .first()
            )
            resolved_name = (
                full_name
                or (f"{guardian.first_name} {guardian.last_name}" if guardian else "Parent")
            )

            user = models.User(
                email=inv.email.lower(),
                hashed_password=get_password_hash(password),
                full_name=resolved_name,
                role=inv.role,
                is_active=True,
                is_verified=True,
                child_id=inv.child_id,
                school_id=inv.school_id,
                guardian_id=guardian.id if guardian else None,
            )
            db.add(user)

        inv.status = "accepted"
        inv.accepted_at = datetime.now(UTC)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def setup_child_account(
        db: Session, child_id: UUID, username: str, pin: str, avatar_emoji: str = "⭐"
    ) -> models.ChildAccount:
        """Create or update child's voice account credentials (PIN and avatar)."""
        child = db.query(models.Child).filter(models.Child.id == child_id).first()
        if not child:
            raise ValueError("Child not found.")

        # Check if username taken by another child
        existing_acc = (
            db.query(models.ChildAccount)
            .filter(
                models.ChildAccount.username == username.lower(),
                models.ChildAccount.child_id != child_id,
            )
            .first()
        )
        if existing_acc:
            raise ValueError("Username already taken. Please choose another.")

        account = (
            db.query(models.ChildAccount)
            .filter(models.ChildAccount.child_id == child_id)
            .first()
        )
        if not account:
            account = models.ChildAccount(
                child_id=child.id,
                username=username.lower(),
                pin_hash=get_password_hash(pin),
                avatar_emoji=avatar_emoji,
            )
            db.add(account)
        else:
            account.username = username.lower()
            account.pin_hash = get_password_hash(pin)
            account.avatar_emoji = avatar_emoji

        # Also create/update child user identity
        child_email = f"{username.lower()}@pupil.stjudes.sch.uk"
        child_user = db.query(models.User).filter(models.User.email == child_email).first()
        if not child_user:
            child_user = models.User(
                email=child_email,
                hashed_password=get_password_hash(pin),
                full_name=child.full_name,
                role="child",
                is_active=True,
                is_verified=True,
                child_id=child.id,
                school_id=child.school_id,
            )
            db.add(child_user)
        else:
            child_user.hashed_password = get_password_hash(pin)

        db.commit()
        db.refresh(account)
        return account
