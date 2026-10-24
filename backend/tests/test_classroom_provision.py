def test_get_classroom_provision_map(client):
    resp = client.get(
        "/api/v1/analytics/classroom-provision/Room%204",
        headers={"X-User-Role": "teacher"},
    )
    assert resp.status_code == 200, f"Error: {resp.status_code} - {resp.text}"
    data = resp.json()

    # Classroom Header & Stats
    assert data["room_name"] == "Room 4"
    assert data["year_group"] == "Year 5"
    assert "Clara Johnson" in data["class_teacher_name"]
    assert "Melissa Grant" in data["primary_ta_name"]
    assert data["total_send_pupils"] == 4
    assert data["ehcp_count"] == 2
    assert data["sen_support_count"] == 2
    assert data["total_weekly_ta_hours"] == 34.0
    assert data["overall_class_win_rate"] > 90.0

    # Graduated Responses (APDR Cycles)
    responses = data["graduated_responses"]
    assert len(responses) == 4

    names = [r["name"] for r in responses]
    assert "Phoenix Carter" in names
    assert "Archie Watson" in names or "Archie Miller" in names
    assert "Riya Patel" in names
    assert "Leo Campbell" in names

    # Phoenix APDR Cycle
    phoenix = next(r for r in responses if r["name"] == "Phoenix Carter")
    assert "EHCP" in phoenix["support_tier"]
    assert phoenix["weekly_ta_hours"] == 15.0
    assert "78 dB" in phoenix["assess_notes"]
    assert len(phoenix["plan_targets"]) >= 3
    assert any("Noise defenders" in d for d in phoenix["do_provisions"])
    assert phoenix["review_outcome"] == "Significant Progress"
    assert len(phoenix["breakthrough_milestones"]) >= 2

    # Statutory Declaration
    assert "CoP 6.44-6.56" in data["statutory_declaration"]
    assert "Section 66" in data["statutory_declaration"]


def test_classroom_provision_rbac_guards(client):
    # SENCO can access
    resp_senco = client.get(
        "/api/v1/analytics/classroom-provision/Room%204",
        headers={"X-User-Role": "senco"},
    )
    assert resp_senco.status_code == 200

    # TA can access
    resp_ta = client.get(
        "/api/v1/analytics/classroom-provision/Room%204",
        headers={"X-User-Role": "ta"},
    )
    assert resp_ta.status_code == 200

    # Child role cannot access
    resp_child = client.get(
        "/api/v1/analytics/classroom-provision/Room%204",
        headers={"X-User-Role": "child"},
    )
    assert resp_child.status_code == 403
