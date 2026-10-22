from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.incident import IncidentDetailResponse, IncidentSubmission
from app.services.incident_service import IncidentService

router = APIRouter()


@router.post("/", response_model=IncidentDetailResponse, status_code=status.HTTP_201_CREATED)
def report_abc_incident(incident_in: IncidentSubmission, db: Session = Depends(get_db)):
    """Log a structured ABC incident (Antecedent, Behaviour, Consequence) with safeguarding triage."""
    try:
        incident = IncidentService.log_incident(db, incident_in)
        return IncidentDetailResponse(
            id=incident.id,
            event_id=incident.event_id,
            child_id=incident.event.child_id,
            event_time=incident.event.event_time,
            reporter_name=incident.event.reporter_name,
            reporter_type=incident.event.reporter_type,
            location=incident.location,
            severity=incident.severity,
            antecedent=incident.antecedent,
            behaviour=incident.behaviour,
            consequence=incident.consequence,
            de_escalation_strategy_used=incident.de_escalation_strategy_used,
            recovery_time_minutes=incident.recovery_time_minutes,
            parent_notified=incident.parent_notified,
            status=incident.event.status,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/children/{child_id}", response_model=list[IncidentDetailResponse])
def get_child_incidents(child_id: UUID, db: Session = Depends(get_db)):
    """Retrieve all structured ABC incidents recorded for a pupil."""
    incidents = IncidentService.get_child_incidents(db, child_id)
    return [
        IncidentDetailResponse(
            id=inc.id,
            event_id=inc.event_id,
            child_id=inc.event.child_id,
            event_time=inc.event.event_time,
            reporter_name=inc.event.reporter_name,
            reporter_type=inc.event.reporter_type,
            location=inc.location,
            severity=inc.severity,
            antecedent=inc.antecedent,
            behaviour=inc.behaviour,
            consequence=inc.consequence,
            de_escalation_strategy_used=inc.de_escalation_strategy_used,
            recovery_time_minutes=inc.recovery_time_minutes,
            parent_notified=inc.parent_notified,
            status=inc.event.status,
        )
        for inc in incidents
    ]
