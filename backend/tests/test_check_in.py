from datetime import date


def test_pupil_check_in_flow(client):
    # 1. Create school & pupil
    school_resp = client.post(
        "/api/v1/schools/",
        json={"school_name": "St. Jude's Academy", "school_reference": "SCH-CHECKIN-1"},
    )
    assert school_resp.status_code == 201
    school_id = school_resp.json()["id"]

    pupil_resp = client.post(
        "/api/v1/pupils/",
        json={
            "school_id": school_id,
            "first_name": "Phoenix",
            "last_name": "Carter",
            "preferred_name": "Phoenix",
            "date_of_birth": str(date(2015, 6, 12)),
            "year_group": "Year 5",
            "send_status": "EHCP",
            "primary_need": "ASC",
        },
    )
    assert pupil_resp.status_code == 201
    child_id = pupil_resp.json()["id"]

    # 2. Pupil logs positive mood
    check_in_resp = client.post(
        f"/api/v1/timeline/children/{child_id}/check-in",
        json={
            "mood_emoji": "😊",
            "mood_label": "Great",
            "energy_level": 4,
            "self_regulation_need": None,
        },
    )
    assert check_in_resp.status_code == 201
    event = check_in_resp.json()
    assert event["event_type"] == "CheckIn"
    assert event["reporter_type"] == "Child"
    assert "Great 😊" in event["title"]
    assert event["significance"] == "Routine"
    assert event["child_check_in"]["mood_emoji"] == "😊"

    # 3. Pupil logs anxiety & requests break
    anxious_resp = client.post(
        f"/api/v1/timeline/children/{child_id}/check-in",
        json={
            "mood_emoji": "😟",
            "mood_label": "Worried",
            "energy_level": 2,
            "self_regulation_need": "Quiet space & noise defenders",
        },
    )
    assert anxious_resp.status_code == 201
    anxious_event = anxious_resp.json()
    assert anxious_event["significance"] == "Concern"
    assert "Quiet space" in anxious_event["summary"]
