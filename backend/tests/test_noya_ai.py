def test_noya_morning_briefing_generation(client):
    # Setup school & pupil
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "Phoenix Academy",
        },
    )
    school_id = school_resp.json()["id"]

    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Phoenix",
            "last_name": "Carter",
            "preferred_name": "Phoenix",
            "date_of_birth": "2015-04-12",
            "year_group": "Year 5",
            "school_id": school_id,
            "primary_need": "Autism Spectrum Condition",
            "has_ehcp": True,
        },
    )
    child_id = child_resp.json()["id"]

    # Log morning handover
    client.post(
        f"/api/v1/transitions/morning-handover/{child_id}?school_id={school_id}&parent_name=Dana%20Carter",
        json={
            "transition_type": "Morning Handover (Home)",
            "sleep_quality": "Restless",
            "morning_mood": "Anxious",
            "special_notes_for_day": "Sensory sensitivities are elevated this morning.",
        },
    )

    # Trigger NOYA Morning Briefing
    briefing_resp = client.post(f"/api/v1/noya/morning-briefing/{child_id}")
    assert briefing_resp.status_code == 200
    briefing_data = briefing_resp.json()
    assert briefing_data["child_name"] == "Phoenix"
    assert "summary_markdown" in briefing_data
    assert len(briefing_data["citations"]) >= 1
    assert "Morning Home Handover" in briefing_data["citations"][0]["citation_text"]


def test_noya_ask_rag_query(client):
    # Setup pupil
    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Phoenix",
            "last_name": "Carter",
            "date_of_birth": "2015-04-12",
            "primary_need": "Autism Spectrum Condition",
        },
    )
    child_id = child_resp.json()["id"]

    # Ask NOYA a question
    ask_resp = client.post(
        "/api/v1/noya/ask",
        json={
            "child_id": child_id,
            "question": "What calm-down strategies have worked best when sensory load is high?",
            "top_k": 3,
        },
    )
    assert ask_resp.status_code == 200
    ask_data = ask_resp.json()
    assert (
        ask_data["question"]
        == "What calm-down strategies have worked best when sensory load is high?"
    )
    assert "answer_markdown" in ask_data
    assert "model_used" in ask_data
