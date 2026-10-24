from datetime import UTC, datetime
from uuid import UUID

from app import models
from app.models.pupil import Child
from app.services.classroom_provision_service import ClassroomProvisionService
from app.services.clinical_dossier_service import ClinicalDossierService
from app.services.seeder_service import SeederService


def test_seeder_service_populates_longitudinal_telemetry(db_session):
    """Verify that SeederService generates complete 30-day multi-pupil telemetry in real database rows."""
    res = SeederService.seed_longitudinal_demo_data(db_session, force_refresh=True)

    assert "school_id" in res
    assert "pupils" in res
    assert len(res["pupils"]) == 4

    # Verify all 4 pupils exist with Room 4 assignment
    pupils = db_session.query(Child).filter(Child.room_name == "Room 4").all()
    assert len(pupils) == 4
    names = [p.first_name for p in pupils]
    assert "Phoenix" in names
    assert "Archie" in names
    assert "Riya" in names
    assert "Leo" in names

    # Verify dedicated staff allocations sum to 34.0h
    allocs = db_session.query(models.StaffPupilAllocation).all()
    assert len(allocs) == 4
    total_hours = sum(a.weekly_allocated_hours for a in allocs)
    assert total_hours == 34.0

    # Verify Phoenix has MedicationRegimen
    phoenix = next(p for p in pupils if p.first_name == "Phoenix")
    med = db_session.query(models.MedicationRegimen).filter(models.MedicationRegimen.child_id == phoenix.id).first()
    assert med is not None
    assert "Equasym" in med.medication_name

    # Verify PupilTargets seeded
    targets = db_session.query(models.PupilTarget).all()
    assert len(targets) >= 6

    # Verify 30 days of longitudinal events
    events = db_session.query(models.ChildEvent).filter(models.ChildEvent.child_id == phoenix.id).all()
    assert len(events) >= 25

    # Verify morning handovers
    handovers = db_session.query(models.TransitionLog).all()
    assert len(handovers) >= 15
    fasted_handovers = [h for h in handovers if h.breakfast_eaten is False]
    assert len(fasted_handovers) >= 3

    # Verify incidents
    incidents = db_session.query(models.BehaviouralIncident).all()
    assert len(incidents) >= 4


def test_classroom_provision_service_is_dynamic(db_session):
    """Verify ClassroomProvisionService computes metrics dynamically from database rows."""
    SeederService.seed_longitudinal_demo_data(db_session)

    summary = ClassroomProvisionService.generate_classroom_provision_map(db_session, room_name="Room 4")

    assert summary.room_name == "Room 4"
    assert summary.total_send_pupils == 4
    assert summary.ehcp_count == 2
    assert summary.sen_support_count == 2
    assert summary.total_weekly_ta_hours == 34.0
    assert summary.overall_class_win_rate > 70.0  # Computed dynamically from observations

    phoenix_item = next(r for r in summary.graduated_responses if "Phoenix" in r.name)
    assert phoenix_item.weekly_ta_hours == 15.0
    assert "Statutory EHCP" in phoenix_item.support_tier
    assert len(phoenix_item.plan_targets) >= 1
    assert "de-escalation success rate" in phoenix_item.review_efficacy.lower()


def test_clinical_dossier_service_is_dynamic(db_session):
    """Verify ClinicalDossierService computes medication titration and fasted incident ratio dynamically."""
    SeederService.seed_longitudinal_demo_data(db_session)

    phoenix = db_session.query(Child).filter(Child.first_name == "Phoenix").first()
    assert phoenix is not None

    dossier = ClinicalDossierService.generate_camhs_dossier(db_session, phoenix.id)

    assert dossier.patient_header.child_id == phoenix.id
    assert "Equasym" in dossier.medication_audit.medication_name
    assert "mornings logged" in dossier.medication_audit.caloric_co_ingestion_compliance
    assert "incident risk" in dossier.medication_audit.fasted_vs_fed_incident_ratio
    assert len(dossier.sensory_environment_audit.top_effective_accommodations) >= 1


def test_reactivity_new_observation_updates_win_rate(db_session):
    """Verify that logging a new observation immediately alters dynamic service output."""
    SeederService.seed_longitudinal_demo_data(db_session)

    phoenix = db_session.query(Child).filter(Child.first_name == "Phoenix").first()
    initial_summary = ClassroomProvisionService.generate_classroom_provision_map(db_session, room_name="Room 4")
    initial_win_rate = initial_summary.overall_class_win_rate

    # Log 10 consecutive failed observations for Phoenix
    for i in range(10):
        ev = models.ChildEvent(
            child_id=phoenix.id,
            school_id=phoenix.school_id,
            event_time=datetime.now(UTC),
            event_type="Observation",
            reporter_type="Teacher",
            title=f"Test Stress Observation {i}",
            summary="Test observation for reactivity verification",
            significance="Routine",
            visibility="Internal School Only",
            status="Logged",
        )
        db_session.add(ev)
        db_session.flush()

        db_session.add(
            models.Observation(
                event_id=ev.id,
                activity_context="Stress Test Maths",
                strategy_used="Failed Test Strategy",
                strategy_worked=False,
                notes="Did not de-escalate",
            )
        )
    db_session.commit()

    # Query again
    updated_summary = ClassroomProvisionService.generate_classroom_provision_map(db_session, room_name="Room 4")

    # Win rate MUST have decreased because 10 failed observations were added!
    assert updated_summary.overall_class_win_rate < initial_win_rate


def test_classroom_matrix_endpoint_dynamic(client):
    """Verify GET /api/v1/pupils/classrooms/room-4/matrix serves all 4 pupils from DB."""
    client.post("/api/v1/auth/demo-login", json={"role": "teacher"})

    resp = client.get(
        "/api/v1/pupils/classrooms/room-4/matrix",
        headers={"X-User-Role": "teacher"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["room_name"] == "Room 4"
    assert len(data["cohort"]) == 4

    names = [p["name"] for p in data["cohort"]]
    assert "Phoenix Carter" in names
    assert "Archie Watson" in names
    assert "Riya Patel" in names
    assert "Leo Campbell" in names
