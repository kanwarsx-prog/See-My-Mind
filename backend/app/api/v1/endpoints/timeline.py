from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.timeline import ChildEventCreate, ChildEventResponse
from app.services.timeline_service import TimelineService

router = APIRouter()


@router.post("/events", response_model=ChildEventResponse, status_code=status.HTTP_201_CREATED)
def log_timeline_event(event_in: ChildEventCreate, db: Session = Depends(get_db)):
    """Log an observation, transition, check-in or incident to the child's timeline."""
    try:
        return TimelineService.create_event(db, event_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/children/{child_id}/events", response_model=list[ChildEventResponse])
def get_child_timeline(
    child_id: UUID,
    skip: int = 0,
    limit: int = 50,
    visibility: str | None = None,
    db: Session = Depends(get_db),
):
    """Retrieve the unified chronological event stream for a pupil."""
    return TimelineService.get_timeline(
        db=db, child_id=child_id, skip=skip, limit=limit, visibility_filter=visibility
    )
