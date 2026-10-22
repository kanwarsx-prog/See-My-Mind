from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.timeline import (
    BehaviouralIncident,
    ChildCheckIn,
    ChildEvent,
    Observation,
    TransitionLog,
)
from app.schemas.timeline import ChildEventCreate


class TimelineService:
    @staticmethod
    def create_event(db: Session, event_in: ChildEventCreate) -> ChildEvent:
        """Create a canonical ChildEvent record on the Transactional Spine,
        along with any specific detail child record.
        """
        db_event = ChildEvent(
            child_id=event_in.child_id,
            school_id=event_in.school_id,
            event_type=event_in.event_type,
            reporter_type=event_in.reporter_type,
            reporter_name=event_in.reporter_name,
            title=event_in.title,
            summary=event_in.summary,
            significance=event_in.significance,
            visibility=event_in.visibility,
            status="Logged",
        )
        db.add(db_event)
        db.flush()  # Generates db_event.id

        # Attach Observation if provided
        if event_in.observation:
            obs = Observation(
                event_id=db_event.id,
                activity_context=event_in.observation.activity_context,
                engagement_level=event_in.observation.engagement_level,
                strategy_used=event_in.observation.strategy_used,
                strategy_worked=event_in.observation.strategy_worked,
                strengths_observed=event_in.observation.strengths_observed,
                notes=event_in.observation.notes,
            )
            db.add(obs)

        # Attach TransitionLog if provided
        if event_in.transition_log:
            trans = TransitionLog(
                event_id=db_event.id,
                transition_type=event_in.transition_log.transition_type,
                sleep_quality=event_in.transition_log.sleep_quality,
                morning_mood=event_in.transition_log.morning_mood,
                breakfast_eaten=event_in.transition_log.breakfast_eaten,
                medication_given=event_in.transition_log.medication_given,
                special_notes_for_day=event_in.transition_log.special_notes_for_day,
            )
            db.add(trans)

        # Attach ChildCheckIn if provided
        if event_in.check_in:
            chk = ChildCheckIn(
                event_id=db_event.id,
                mood_emoji=event_in.check_in.mood_emoji,
                mood_label=event_in.check_in.mood_label,
                energy_level=event_in.check_in.energy_level,
                self_regulation_need=event_in.check_in.self_regulation_need,
                voice_note_text=event_in.check_in.voice_note_text,
            )
            db.add(chk)

        # Attach BehaviouralIncident if provided
        if event_in.incident:
            inc = BehaviouralIncident(
                event_id=db_event.id,
                location=event_in.incident.location,
                severity=event_in.incident.severity,
                antecedent=event_in.incident.antecedent,
                behaviour=event_in.incident.behaviour,
                consequence=event_in.incident.consequence,
                de_escalation_strategy_used=event_in.incident.de_escalation_strategy_used,
                recovery_time_minutes=event_in.incident.recovery_time_minutes,
                parent_notified=event_in.incident.parent_notified,
            )
            db.add(inc)

        db.commit()
        db.refresh(db_event)
        return db_event

    @staticmethod
    def get_timeline(
        db: Session,
        child_id: UUID,
        skip: int = 0,
        limit: int = 50,
        visibility_filter: str | None = None,
    ) -> list[ChildEvent]:
        query = (
            db.query(ChildEvent)
            .filter(ChildEvent.child_id == child_id)
            .options(
                joinedload(ChildEvent.observation),
                joinedload(ChildEvent.transition_log),
                joinedload(ChildEvent.child_check_in),
                joinedload(ChildEvent.incident),
            )
            .order_by(ChildEvent.event_time.desc())
        )
        if visibility_filter:
            query = query.filter(ChildEvent.visibility == visibility_filter)

        return query.offset(skip).limit(limit).all()
