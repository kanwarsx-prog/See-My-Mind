from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.schemas.auth import AuthTokenResponse, DemoLoginRequest, LoginRequest
from app.schemas.registration import UserResponse

router = APIRouter()

DEMO_ACCOUNTS = {
    "senco": {
        "email": "senco@stjudes.sch.uk",
        "full_name": "Ms Amara Okafor",
        "role": "senco",
    },
    "teacher": {
        "email": "teacher@stjudes.sch.uk",
        "full_name": "Ms Clara Johnson",
        "role": "teacher",
    },
    "ta": {
        "email": "ta@stjudes.sch.uk",
        "full_name": "Melissa Grant",
        "role": "ta",
    },
    "parent": {
        "email": "dana.carter@example.com",
        "full_name": "Dana Carter",
        "role": "parent",
    },
    "child": {
        "email": "phoenix@pupil.stjudes.sch.uk",
        "full_name": "Phoenix Carter",
        "role": "child",
        "username": "phoenix",
        "pin": "1234",
    },
}


def _ensure_demo_entities(db: Session) -> tuple[models.School, models.Child]:
    """Ensure baseline school and primary child exist for demo accounts."""
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

    child = db.query(models.Child).filter(models.Child.first_name == "Phoenix").first()
    if not child:
        child = models.Child(
            first_name="Phoenix",
            last_name="Carter",
            full_name="Phoenix Carter",
            preferred_name="Phoenix",
            date_of_birth=datetime(2015, 6, 15, tzinfo=UTC).date(),
            sex="Male",
            year_group="Year 5",
            school_id=school.id,
            active=True,
        )
        db.add(child)
        db.flush()

        profile = models.ChildSupportProfile(
            child_id=child.id,
            primary_need="Autism Spectrum Condition (ASC)",
            secondary_need="Working Memory & Auditory Processing",
            has_ehcp=True,
            active=True,
            summary="Thrives with visual structure and pre-flight morning handover checks.",
        )
        db.add(profile)
        db.flush()

    # Ensure Phoenix has a ChildAccount
    phoenix_acc = (
        db.query(models.ChildAccount)
        .filter(models.ChildAccount.child_id == child.id)
        .first()
    )
    if not phoenix_acc:
        phoenix_acc = models.ChildAccount(
            child_id=child.id,
            username="phoenix",
            pin_hash=get_password_hash("1234"),
            avatar_emoji="⭐",
        )
        db.add(phoenix_acc)
        db.flush()

    return school, child


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User or Pupil login",
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate either via email + password (staff/parent) or username + 4-digit PIN (pupil voice)."""
    identifier = body.email_or_username.strip().lower()
    secret = body.password_or_pin.strip()

    # 1. Check if identifier is a child voice account username
    child_acc = (
        db.query(models.ChildAccount)
        .filter(models.ChildAccount.username == identifier)
        .first()
    )
    if child_acc:
        if not child_acc.pin_hash or not verify_password(secret, child_acc.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect 4-digit PIN for pupil voice login.",
            )

        child = db.query(models.Child).filter(models.Child.id == child_acc.child_id).first()
        child_email = f"{child_acc.username}@pupil.stjudes.sch.uk"
        user = db.query(models.User).filter(models.User.email == child_email).first()
        if not user:
            user = models.User(
                email=child_email,
                hashed_password=child_acc.pin_hash,
                full_name=child.full_name if child else child_acc.username,
                role="child",
                is_active=True,
                is_verified=True,
                child_id=child_acc.child_id,
                school_id=child.school_id if child else None,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(subject=user.id)
        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": "child",
                "child_id": str(user.child_id) if user.child_id else None,
                "avatar_emoji": child_acc.avatar_emoji,
                "username": child_acc.username,
            },
        )

    # 2. Standard user login by email
    user = db.query(models.User).filter(models.User.email == identifier).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email address or username.",
        )

    if not verify_password(secret, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact your school administrator.",
        )

    token = create_access_token(subject=user.id)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "child_id": str(user.child_id) if user.child_id else None,
        },
    )


@router.post(
    "/demo-login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="1-Click demo authentication for evaluators",
)
def demo_login(body: DemoLoginRequest, db: Session = Depends(get_db)):
    """Instantly authenticate into one of the 5 personas (senco, teacher, parent, child, ta)
    with a legitimate JWT token for evaluation.
    """
    role = body.role.lower().strip()
    if role not in DEMO_ACCOUNTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid demo role '{role}'. Expected one of: {list(DEMO_ACCOUNTS.keys())}",
        )

    school, child = _ensure_demo_entities(db)
    cfg = DEMO_ACCOUNTS[role]
    email = cfg["email"]

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            hashed_password=get_password_hash("password123"),
            full_name=cfg["full_name"],
            role=role,
            is_active=True,
            is_verified=True,
            school_id=school.id,
            child_id=child.id if role in ["parent", "child"] else None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "child_id": str(user.child_id) if user.child_id else None,
        },
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated current user profile",
)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the profile and role of the currently logged-in user."""
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
        created_at=current_user.created_at or datetime.now(UTC),
    )
