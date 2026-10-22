from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.organisation import School
from app.schemas.organisation import SchoolCreate, SchoolResponse

router = APIRouter()


@router.post("/", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
def create_school(school_in: SchoolCreate, db: Session = Depends(get_db)):
    school = School(
        school_name=school_in.school_name,
        school_reference=school_in.school_reference,
        town_city=school_in.town_city,
        postcode=school_in.postcode,
        main_email=school_in.main_email,
        main_telephone=school_in.main_telephone,
        active=school_in.active,
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    return school


@router.get("/", response_model=list[SchoolResponse])
def list_schools(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(School).offset(skip).limit(limit).all()


@router.get("/{school_id}", response_model=SchoolResponse)
def get_school(school_id: UUID, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school
