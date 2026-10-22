from datetime import date


def test_abc_incident_reporting_and_safeguarding(client):
    # 1. Setup school and child
    school_resp = client.post(
        "/api/v1/schools/",
        json={"school_name": "St. Jude's Academy", "school_reference": "SCH-INCIDENT-1"},
    )
    school_id = school_resp.json()["id"]

    pupil_resp = client.post(
        "/api/v1/pupils/",
        json={
            "school_id": school_id,
            "first_name": "Phoenix",
            "last_name": "Carter",
            "date_of_birth": str(date(2015, 6, 12)),
            "year_group": "Year 5",
            "send_status": "EHCP",
            "primary_need": "ASC",
        },
    )
    child_id = pupil_resp.json()["id"]

    # 2. Log moderate ABC incident
    inc_resp = client.post(
        "/api/v1/incidents/",
        json={
            "child_id": child_id,
            "reporter_name": "Ms Johnson",
            "reporter_type": "Teacher",
            "location": "Science Lab",
            "severity": "Moderate",
            "antecedent": "Sudden fire alarm drill announcement without visual pre-warning.",
            "behaviour": "Child covered ears, shouted, hid under laboratory bench refusing to move.",
            "consequence": "Noise defenders offered by TA. Guided to quiet sensory garden; heart rate normalized after 12 mins.",
            "de_escalation_strategy_used": "Ear defenders & quiet sensory zone",
            "recovery_time_minutes": 12,
            "parent_notified": True,
            "follow_up_action": "Ensure 5-minute individual warning given before future scheduled drills.",
        },
    )
    assert inc_resp.status_code == 201
    inc_data = inc_resp.json()
    assert inc_data["severity"] == "Moderate"
    assert inc_data["location"] == "Science Lab"
    assert inc_data["recovery_time_minutes"] == 12

    # 3. Retrieve incidents for pupil
    list_resp = client.get(f"/api/v1/incidents/children/{child_id}")
    assert list_resp.status_code == 200
    incidents = list_resp.json()
    assert len(incidents) == 1
    assert incidents[0]["antecedent"].startswith("Sudden fire alarm")
