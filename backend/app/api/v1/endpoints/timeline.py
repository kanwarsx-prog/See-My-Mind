from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.timeline import ChildCheckInCreate, ChildEventCreate, ChildEventResponse
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


@router.post(
    "/children/{child_id}/check-in",
    response_model=ChildEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_pupil_check_in(
    child_id: UUID,
    check_in: ChildCheckInCreate,
    db: Session = Depends(get_db),
):
    """Log a direct pupil voice mood check-in or self-regulation support request."""
    significance = (
        "Concern" if check_in.mood_label in ["Worried", "Angry", "Exhausted"] else "Routine"
    )
    summary = (
        f"Support request: {check_in.self_regulation_need}"
        if check_in.self_regulation_need
        else f"Pupil mood logged as {check_in.mood_label}."
    )

    event_in = ChildEventCreate(
        child_id=child_id,
        event_type="CheckIn",
        reporter_type="Child",
        reporter_name="Pupil Voice",
        title=f"Pupil Voice: {check_in.mood_label} {check_in.mood_emoji}",
        summary=summary,
        significance=significance,
        visibility="Shared",
        check_in=check_in,
    )
    return TimelineService.create_event(db, event_in)
