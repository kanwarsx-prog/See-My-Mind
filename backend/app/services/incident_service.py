from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.timeline import BehaviouralIncident, ChildEvent, FollowUpAction
from app.schemas.incident import IncidentSubmission


class IncidentService:
    @staticmethod
    def log_incident(db: Session, inc_in: IncidentSubmission) -> BehaviouralIncident:
        # Determine governance significance & visibility
        is_safeguarding = inc_in.severity == "Safeguarding Incident"
        significance = (
            "High Priority"
            if inc_in.severity in ["Moderate", "High", "Safeguarding Incident"]
            else "Routine"
        )
        visibility = (
            "Safeguarding Restricted"
            if is_safeguarding
            else ("Shared" if inc_in.parent_notified else "Internal School Only")
        )

        # Create canonical ChildEvent spine
        event = ChildEvent(
            child_id=inc_in.child_id,
            event_type="Incident",
            reporter_type=inc_in.reporter_type,
            reporter_name=inc_in.reporter_name,
            title=f"ABC Incident: {inc_in.severity} ({inc_in.location})",
            summary=f"Behaviour: {inc_in.behaviour[:120]}... Resolution: {inc_in.consequence[:120]}...",
            significance=significance,
            visibility=visibility,
            status="Action Required" if (is_safeguarding or inc_in.follow_up_action) else "Logged",
        )
        db.add(event)
        db.flush()

        incident = BehaviouralIncident(
            event_id=event.id,
            location=inc_in.location,
            severity=inc_in.severity,
            antecedent=inc_in.antecedent,
            behaviour=inc_in.behaviour,
            consequence=inc_in.consequence,
            de_escalation_strategy_used=inc_in.de_escalation_strategy_used,
            recovery_time_minutes=inc_in.recovery_time_minutes,
            parent_notified=inc_in.parent_notified,
        )
        db.add(incident)

        if inc_in.follow_up_action:
            action = FollowUpAction(
                event_id=event.id,
                title=f"Incident Follow-Up ({inc_in.severity})",
                description=inc_in.follow_up_action,
                assigned_to_role="SENCO" if is_safeguarding else "Class Teacher",
                completed=False,
            )
            db.add(action)

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_child_incidents(db: Session, child_id: UUID) -> list[BehaviouralIncident]:
        return (
            db.query(BehaviouralIncident)
            .join(ChildEvent, BehaviouralIncident.event_id == ChildEvent.id)
            .filter(ChildEvent.child_id == child_id)
            .options(joinedload(BehaviouralIncident.event))
            .order_by(ChildEvent.event_time.desc())
            .all()
        )
