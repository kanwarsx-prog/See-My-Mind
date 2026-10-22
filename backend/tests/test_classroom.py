from app.models.pupil import Child


def test_get_classroom_matrix(client):
    # Ensure baseline entities exist via demo login
    client.post("/api/v1/auth/demo-login", json={"role": "teacher"})

    resp = client.get(
        "/api/v1/pupils/classrooms/room-4/matrix",
        headers={"X-User-Role": "teacher"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["room_name"] == "Room 4"
    assert data["lead_teacher"] == "Ms Clara Johnson"
    assert len(data["cohort"]) == 4

    # Verify Phoenix and Archie are present
    names = [p["name"] for p in data["cohort"]]
    assert "Phoenix Carter" in names
    assert "Archie Watson" in names

    # Verify subject accommodations exist
    phoenix = next(p for p in data["cohort"] if p["name"] == "Phoenix Carter")
    assert "maths" in phoenix["subject_accommodations"]
    assert "assembly" in phoenix["subject_accommodations"]


def test_log_de_escalation_observation(client, db_session):
    # Ensure baseline entities exist via demo login
    client.post("/api/v1/auth/demo-login", json={"role": "teacher"})

    child = db_session.query(Child).filter(Child.first_name == "Phoenix").first()
    assert child is not None

    payload = {
        "child_id": str(child.id),
        "school_id": str(child.school_id) if child.school_id else None,
        "event_type": "Observation",
        "reporter_type": "Teacher",
        "reporter_name": "Ms Clara Johnson",
        "title": "In-the-Moment De-Escalation: Acoustic Shelter + 5-Min Timer",
        "summary": "Visual sand timer flipped and noise defenders offered. Sensory agitation settled in 3 minutes.",
        "significance": "Notable Win",
        "visibility": "Shared",
        "observation": {
            "activity_context": "Pre-Assembly Classroom Transition",
            "strategy_used": "Acoustic Shelter + 5-Min Visual Timer",
            "strategy_worked": True,
            "strengths_observed": "Self-advocacy in accepting headphones without hesitation",
            "notes": "Pupil ready for morning maths without dysregulation.",
        },
    }

    resp = client.post(
        "/api/v1/timeline/events",
        json=payload,
        headers={"X-User-Role": "teacher"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == payload["title"]
    assert data["observation"]["strategy_worked"] is True
    assert data["observation"]["strategy_used"] == "Acoustic Shelter + 5-Min Visual Timer"
