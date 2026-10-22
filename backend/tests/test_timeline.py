def test_school_and_pupil_creation(client):
    # 1. Create a school
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "St. Jude's Inclusive Academy",
            "school_reference": "SCH-1002",
            "town_city": "London",
            "postcode": "SE1 7PB",
            "main_email": "admin@stjudes.sch.uk",
        },
    )
    assert school_resp.status_code == 201
    school_data = school_resp.json()
    school_id = school_data["id"]

    # 2. Create a child
    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Phoenix",
            "last_name": "Carter",
            "preferred_name": "Phoenix",
            "date_of_birth": "2015-04-12",
            "sex": "Prefer not to say",
            "year_group": "Year 5",
            "school_id": school_id,
            "primary_need": "Autism Spectrum Condition",
            "has_ehcp": True,
        },
    )
    assert child_resp.status_code == 201
    child_data = child_resp.json()
    assert child_data["first_name"] == "Phoenix"
    assert child_data["support_profile"]["primary_need"] == "Autism Spectrum Condition"


def test_timeline_observation_and_transition(client):
    # Setup school & pupil
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "Oakfield Primary",
            "school_reference": "SCH-2001",
        },
    )
    school_id = school_resp.json()["id"]

    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Luca",
            "last_name": "Moretti",
            "date_of_birth": "2016-09-18",
            "school_id": school_id,
        },
    )
    child_id = child_resp.json()["id"]

    # 1. Teacher logs an observation
    obs_resp = client.post(
        "/api/v1/timeline/events",
        json={
            "child_id": child_id,
            "school_id": school_id,
            "event_type": "Observation",
            "reporter_type": "Teacher",
            "reporter_name": "Ms Johnson",
            "title": "Science Lesson Engagement",
            "summary": "Luca engaged brilliantly in the group experiment with water density.",
            "significance": "Notable Win",
            "visibility": "Shared",
            "observation": {
                "activity_context": "Science practical",
                "engagement_level": "High",
                "strategy_used": "Visual task card",
                "strategy_worked": True,
                "strengths_observed": "Curiosity and attention to detail",
            },
        },
    )
    assert obs_resp.status_code == 201
    obs_data = obs_resp.json()
    assert obs_data["title"] == "Science Lesson Engagement"
    assert obs_data["observation"]["strategy_worked"] is True

    # 2. Parent logs morning handover
    handover_resp = client.post(
        f"/api/v1/transitions/morning-handover/{child_id}?school_id={school_id}&parent_name=Elena%20Moretti",
        json={
            "transition_type": "Morning Handover (Home)",
            "sleep_quality": "Restless",
            "morning_mood": "Anxious",
            "breakfast_eaten": True,
            "medication_given": False,
            "special_notes_for_day": "Worried about the assembly today. Please remind him about noise defenders.",
        },
    )
    assert handover_resp.status_code == 201
    handover_data = handover_resp.json()
    assert handover_data["event_type"] == "Transition"
    assert handover_data["transition_log"]["morning_mood"] == "Anxious"

    # Acknowledge transition
    trans_id = handover_data["transition_log"]["id"]
    ack_resp = client.patch(f"/api/v1/transitions/transitions/{trans_id}/acknowledge")
    assert ack_resp.status_code == 200
    assert ack_resp.json()["acknowledged_by_staff"] is True

    # Check latest handover endpoint
    latest_resp = client.get(f"/api/v1/transitions/children/{child_id}/latest")
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["id"] == trans_id
    assert latest_data["acknowledged_by_staff"] is True
    assert latest_data["morning_mood"] == "Anxious"

    # 3. Retrieve the child's unified timeline
    timeline_resp = client.get(f"/api/v1/timeline/children/{child_id}/events")
    assert timeline_resp.status_code == 200
    events = timeline_resp.json()
    assert len(events) == 2
    # Verify both observation and transition appear chronologically
    event_types = [e["event_type"] for e in events]
    assert "Observation" in event_types
    assert "Transition" in event_types
