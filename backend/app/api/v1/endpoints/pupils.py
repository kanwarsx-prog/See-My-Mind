from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.pupil import Child
from app.models.support import ChildSupportProfile
from app.schemas.pupil import ChildCreate, ChildResponse

router = APIRouter()


@router.post("/", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def create_child(child_in: ChildCreate, db: Session = Depends(get_db)):
    full_name = f"{child_in.first_name} {child_in.last_name}"
    child = Child(
        first_name=child_in.first_name,
        last_name=child_in.last_name,
        full_name=full_name,
        preferred_name=child_in.preferred_name or child_in.first_name,
        date_of_birth=child_in.date_of_birth,
        sex=child_in.sex,
        year_group=child_in.year_group,
        school_id=child_in.school_id,
        active=child_in.active,
    )
    db.add(child)
    db.flush()

    # Create associated support profile
    profile = ChildSupportProfile(
        child_id=child.id,
        primary_need=child_in.primary_need,
        has_ehcp=child_in.has_ehcp,
    )
    db.add(profile)
    db.commit()
    db.refresh(child)
    return child


@router.get("/", response_model=list[ChildResponse])
def list_children(
    school_id: UUID | None = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)
):
    query = db.query(Child).options(joinedload(Child.support_profile))
    if school_id:
        query = query.filter(Child.school_id == school_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(child_id: UUID, db: Session = Depends(get_db)):
    child = (
        db.query(Child)
        .options(joinedload(Child.support_profile))
        .filter(Child.id == child_id)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child
