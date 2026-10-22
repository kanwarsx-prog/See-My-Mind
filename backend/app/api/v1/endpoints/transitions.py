from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.timeline import ChildEventResponse, TransitionLogCreate, TransitionLogResponse
from app.services.transition_service import TransitionService

router = APIRouter()


@router.post(
    "/morning-handover/{child_id}",
    response_model=ChildEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_morning_handover(
    child_id: UUID,
    transition_in: TransitionLogCreate,
    parent_name: str = "Parent",
    school_id: UUID | None = None,
    db: Session = Depends(get_db),
):
    """Parent logs morning handover details before child arrives at school."""
    try:
        return TransitionService.log_morning_handover(
            db=db,
            child_id=child_id,
            school_id=school_id,
            parent_name=parent_name,
            transition_data=transition_in,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/transitions/{transition_id}/acknowledge", response_model=TransitionLogResponse)
def acknowledge_transition(transition_id: UUID, db: Session = Depends(get_db)):
    """Teacher or TA acknowledges receipt of the morning handover."""
    try:
        return TransitionService.acknowledge_transition(db=db, transition_id=transition_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/children/{child_id}/latest", response_model=TransitionLogResponse | None)
def get_latest_handover(child_id: UUID, db: Session = Depends(get_db)):
    """Retrieve the latest morning handover details and staff acknowledgment state."""
    return TransitionService.get_latest_handover(db=db, child_id=child_id)
