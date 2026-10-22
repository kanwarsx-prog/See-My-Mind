"""Seed demo script for See My Mind & NOYA AI.
Populates realistic demo data matching the prototype wireframe (Phoenix Carter, Ms Johnson, Dana Carter).
"""

from datetime import date

from app import models
from app.ai.rag_service import NoyaRAGService
from app.core.database import Base, SessionLocal, engine
from app.schemas.timeline import ChildEventCreate, ObservationCreate, TransitionLogCreate
from app.services.timeline_service import TimelineService
from app.services.transition_service import TransitionService


def seed_demo_data():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_school = (
            db.query(models.School).filter(models.School.school_reference == "SCH-STJUDES").first()
        )
        if existing_school:
            print("Demo data already seeded! Fetching existing records...")
            school = existing_school
            child = db.query(models.Child).filter(models.Child.school_id == school.id).first()
        else:
            print("1. Creating School: St. Jude's Inclusive Academy...")
            school = models.School(
                school_name="St. Jude's Inclusive Academy",
                school_reference="SCH-STJUDES",
                town_city="London",
                postcode="SE1 7PB",
                main_email="admin@stjudes.sch.uk",
                main_telephone="020 7946 0192",
                active=True,
            )
            db.add(school)
            db.flush()

            print("2. Creating Staff: Ms Okafor (SENCO) and Ms Johnson (Teacher)...")
            senco = models.StaffMember(
                first_name="Amara",
                last_name="Okafor",
                email="a.okafor@stjudes.sch.uk",
            )
            teacher = models.StaffMember(
                first_name="Sarah",
                last_name="Johnson",
                email="s.johnson@stjudes.sch.uk",
            )
            db.add_all([senco, teacher])
            db.flush()

            db.add_all(
                [
                    models.StaffSchoolAssignment(
                        staff_id=senco.id,
                        school_id=school.id,
                        role="SENCO",
                        job_title="Head of SEND",
                    ),
                    models.StaffSchoolAssignment(
                        staff_id=teacher.id,
                        school_id=school.id,
                        role="Teacher",
                        job_title="Year 5 Class Teacher",
                    ),
                ]
            )

            print("3. Creating Pupil: Phoenix Carter...")
            child = models.Child(
                first_name="Phoenix",
                last_name="Carter",
                full_name="Phoenix Carter",
                preferred_name="Phoenix",
                date_of_birth=date(2015, 4, 12),
                sex="Prefer not to say",
                year_group="Year 5",
                school_id=school.id,
                active=True,
            )
            db.add(child)
            db.flush()

            print("4. Creating Guardian: Dana Carter...")
            guardian = models.Guardian(
                first_name="Dana",
                last_name="Carter",
                email="dana.carter@example.co.uk",
                mobile_phone="07700 900123",
                relationship_to_child="Mother",
            )
            db.add(guardian)
            db.flush()

            db.add(
                models.ChildGuardianLink(
                    child_id=child.id,
                    guardian_id=guardian.id,
                    parental_responsibility=True,
                    emergency_contact=True,
                    primary_carer=True,
                )
            )

            print("5. Building Phoenix's Support Profile & Strategies...")
            profile = models.ChildSupportProfile(
                child_id=child.id,
                primary_need="Autism Spectrum Condition",
                secondary_need="Sensory Processing Sensitivity",
                summary="Phoenix is an inquisitive, highly capable student who thrives with predictable routines, clear visual structures, and proactive sensory regulation breaks.",
                communication_preferences="Clear, direct 1-step instructions. Prefers visual timetable to verbal changes.",
                sensory_profile="Sensitive to loud sudden noises (school bell, busy assemblies) and fluorescent light flicker.",
                strengths_interests="Deep interest in space science, robotics, and creative problem solving.",
                has_ehcp=True,
            )
            db.add(profile)
            db.flush()

            # Add Triggers & Strategies
            db.add_all(
                [
                    models.ChildTrigger(
                        profile_id=profile.id,
                        trigger_title="Unannounced Schedule Changes / Assemblies",
                        trigger_category="Sensory & Transition",
                        description="Sudden changes of room or loud multi-class assemblies can trigger rising sensory overwhelm.",
                    ),
                    models.ChildDistressIndicator(
                        profile_id=profile.id,
                        stage="Early Warning (Rumbling)",
                        observable_behaviour="Pacing, tapping pencil rapidly, putting hands over ears.",
                        recommended_staff_action="Offer 5-minute quiet corner break with noise-canceling headphones.",
                    ),
                    models.ChildSupportStrategy(
                        profile_id=profile.id,
                        custom_title="Visual Task Strip",
                        custom_instructions="Break each lesson into 3 checklist items on Phoenix's desk whiteboard.",
                        priority=1,
                        effective_rating="Highly Effective",
                    ),
                ]
            )
            db.commit()

            print("6. Logging Yesterday's Science Observation...")
            TimelineService.create_event(
                db,
                ChildEventCreate(
                    child_id=child.id,
                    school_id=school.id,
                    event_type="Observation",
                    reporter_type="Teacher",
                    reporter_name="Ms Johnson",
                    title="Superb Science Practical Engagement",
                    summary="Phoenix excelled in the density experiment, helping group peers and explaining water displacement clearly.",
                    significance="Notable Win",
                    visibility="Shared",
                    observation=ObservationCreate(
                        activity_context="Year 5 Science Practical",
                        engagement_level="High",
                        strategy_used="Visual Task Strip",
                        strategy_worked=True,
                        strengths_observed="Leadership, logical analysis, peer collaboration",
                    ),
                ),
            )

            print("7. Logging Today's Morning Handover from Dana Carter (Parent)...")
            TransitionService.log_morning_handover(
                db=db,
                child_id=child.id,
                school_id=school.id,
                parent_name="Dana Carter",
                transition_data=TransitionLogCreate(
                    transition_type="Morning Handover (Home)",
                    sleep_quality="Restless (woke at 4am)",
                    morning_mood="Anxious",
                    breakfast_eaten=True,
                    medication_given=False,
                    special_notes_for_day="A bit nervous about the whole-school assembly this morning. Please make sure noise defenders are accessible.",
                ),
            )

        print("\n" + "=" * 60)
        print("SEEDING COMPLETE!")
        print(f"School ID: {school.id}")
        print(f"Child ID:  {child.id} ({child.full_name})")
        print("=" * 60)

        # 8. Test NOYA Briefing
        print("\n8. Generating NOYA Morning Transition Briefing for Ms Johnson...")
        briefing = NoyaRAGService.generate_morning_briefing(db, child.id)
        print("\n--- NOYA BRIEFING OUTPUT ---")
        print(briefing.summary_markdown)
        print("----------------------------\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
