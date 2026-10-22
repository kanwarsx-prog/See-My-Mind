from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.parent_hub import (
    DecompressionBridgeResponse,
    EveningCheckInCreate,
    EveningCheckInResponse,
    MedicationCorrelationResponse,
    ParentWinsGalleryItem,
)
from app.schemas.timeline import ChildEventResponse, TransitionLogCreate, TransitionLogResponse
from app.services.parent_hub_service import ParentHubService
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


@router.get("/children/{child_id}/decompression-bridge", response_model=DecompressionBridgeResponse)
def get_decompression_bridge(child_id: UUID, db: Session = Depends(get_db)):
    """Predicts after-school sensory battery level and delivers arrival recipe from adult proxy observations."""
    try:
        return ParentHubService.get_decompression_bridge(db=db, child_id=child_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/evening-handover/{child_id}",
    response_model=EveningCheckInResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_evening_handover(
    child_id: UUID,
    checkin_in: EveningCheckInCreate,
    db: Session = Depends(get_db),
):
    """Parent logs quick 20-second evening recovery check-in, syncing into school timeline for tomorrow morning."""
    try:
        checkin_in.child_id = child_id
        return ParentHubService.log_evening_checkin(db=db, checkin_in=checkin_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/children/{child_id}/correlation-digest", response_model=MedicationCorrelationResponse)
def get_medication_correlation_digest(child_id: UUID, db: Session = Depends(get_db)):
    """Longitudinal correlation between morning medication, breakfast, sleep, and afternoon dysregulation."""
    try:
        return ParentHubService.get_medication_correlation(db=db, child_id=child_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/children/{child_id}/wins-gallery", response_model=list[ParentWinsGalleryItem])
def get_child_wins_gallery(child_id: UUID, db: Session = Depends(get_db)):
    """Neuro-affirming strengths and breakthrough moments celebrating the child's brilliance."""
    try:
        return ParentHubService.get_wins_gallery(db=db, child_id=child_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
