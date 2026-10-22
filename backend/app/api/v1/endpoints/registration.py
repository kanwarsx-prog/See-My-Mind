from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.api.deps import get_current_user, get_db, require_roles
from app.core.security import create_access_token
from app.schemas.registration import (
    AcceptInvitationRequest,
    ChildAccountSetupRequest,
    ChildRegistrationRequest,
    ChildRegistrationResponse,
    DispatchedEmailPreview,
    InvitationValidationResponse,
    UserResponse,
)
from app.services.email_service import EmailService
from app.services.registration_service import RegistrationService

router = APIRouter()


@router.post(
    "/children",
    response_model=ChildRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new SEND pupil (SENCO / Admin only)",
)
def register_child(
    reg_data: ChildRegistrationRequest,
    current_user: models.User = Depends(require_roles(["senco", "admin"])),
    db: Session = Depends(get_db),
):
    """SENCO or Admin registers a child on the SEND register, sets up baseline support profile,
    links parent/guardian, and dispatches onboarding invitation email.
    """
    try:
        return RegistrationService.register_child(
            db=db,
            reg_data=reg_data,
            created_by_senco_name=current_user.full_name or "Amara Okafor (SENCO)",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {e!s}",
        )


@router.get(
    "/invitations/{token}",
    response_model=InvitationValidationResponse,
    summary="Validate parent onboarding invitation token",
)
def validate_invitation(token: str, db: Session = Depends(get_db)):
    """Validate whether an invitation token is active, valid, and not expired."""
    return RegistrationService.validate_invitation(db=db, token=token)


@router.post(
    "/accept-invitation",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Parent accepts invitation and sets password",
)
def accept_invitation(body: AcceptInvitationRequest, db: Session = Depends(get_db)):
    """Parent provides secure password to activate their parent portal account."""
    try:
        user = RegistrationService.accept_invitation(
            db=db,
            token=body.token,
            password=body.password,
            full_name=body.full_name,
        )
        access_token = create_access_token(subject=user.id)
        return {
            "message": "Account activated successfully.",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "child_id": str(user.child_id) if user.child_id else None,
            },
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "/children/{child_id}/setup-child-account",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Configure child's voice account credentials (PIN & Avatar)",
)
def setup_child_account(
    child_id: UUID,
    body: ChildAccountSetupRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Parent or SENCO configures the pupil's voice account with an easy 4-digit PIN and avatar."""
    if current_user.role not in ["parent", "senco", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents or SENCOs can configure child voice accounts.",
        )

    try:
        acc = RegistrationService.setup_child_account(
            db=db,
            child_id=child_id,
            username=body.username,
            pin=body.pin,
            avatar_emoji=body.avatar_emoji,
        )
        return {
            "message": f"Child voice account for '{acc.username}' created successfully.",
            "child_id": str(acc.child_id),
            "username": acc.username,
            "avatar_emoji": acc.avatar_emoji,
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.get(
    "/recent-invitations",
    response_model=list[DispatchedEmailPreview],
    summary="Get recent dispatched invitation email previews for testing",
)
def get_recent_invitations():
    """Retrieve captured invitation emails in development/staging for instant 1-click testing."""
    return EmailService.get_recent_invitations()


@router.get(
    "/current-user",
    response_model=UserResponse,
    summary="Get authenticated current user & role details",
)
def get_current_user_profile(
    current_user: models.User = Depends(get_current_user),
):
    """Return identity and active role of the current user."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        child_id=current_user.child_id,
        guardian_id=current_user.guardian_id,
        school_id=current_user.school_id,
        created_at=current_user.created_at or current_user.updated_at,
    )
