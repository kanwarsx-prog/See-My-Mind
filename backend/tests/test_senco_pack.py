import uuid

from app.models.pupil import Child


def test_get_school_provision_matrix(client):
    # Ensure baseline entities exist
    client.post("/api/v1/auth/demo-login", json={"role": "senco"})

    resp = client.get(
        "/api/v1/pupils/school/provision-matrix",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["school_name"] == "St. Jude's Inclusive Academy"
    assert data["total_send_count"] == 34
    assert data["ehcp_count"] == 12
    assert data["sen_support_count"] == 22
    assert "Amara Okafor" in data["lead_senco"] or "Sarah Davies" in data["lead_senco"]
    assert len(data["pupils"]) >= 10

    # Verify Phoenix Carter is in the provision matrix
    phoenix_entry = next((p for p in data["pupils"] if "Phoenix" in p["name"]), None)
    assert phoenix_entry is not None
    assert phoenix_entry["support_tier"] == "Statutory EHCP"
    assert "Band 3" in phoenix_entry["funding_band"]
    assert phoenix_entry["allocated_ta_hours"] == 25.0
    assert phoenix_entry["assigned_ta"] == "Melissa Grant"


def test_get_annual_review_pack(client, db_session):
    client.post("/api/v1/auth/demo-login", json={"role": "senco"})

    child = db_session.query(Child).filter(Child.first_name == "Phoenix").first()
    assert child is not None

    resp = client.get(
        f"/api/v1/pupils/{child.id}/annual-review-pack",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert "Phoenix" in data["child_name"]
    assert data["school_name"] == "St. Jude's Inclusive Academy"
    assert "Amara Okafor" in data["senco_name"] or "Sarah Davies" in data["senco_name"]

    # Verify metrics
    metrics = data["metrics"]
    assert metrics["total_evidence_observations"] >= 1
    assert "%" in metrics["de_escalation_win_rate"]
    assert metrics["morning_handovers_received"] >= 1

    # Verify Section A
    sec_a = data["section_a"]
    assert "child_views" in sec_a
    assert "parent_views" in sec_a
    assert "Dana Carter" in sec_a["parent_views"]

    # Verify Section B (4 Areas of Need)
    sec_b = data["section_b"]
    assert len(sec_b) >= 4
    b_areas = [b["area_of_need"] for b in sec_b]
    assert "Cognition & Learning" in b_areas
    assert "Communication & Interaction" in b_areas
    assert "Social, Emotional & Mental Health (SEMH)" in b_areas
    assert "Sensory & Physical" in b_areas

    # Verify Section E (Outcomes)
    sec_e = data["section_e"]
    assert len(sec_e) >= 3
    assert any(e["status"] in ["Met", "On Track"] for e in sec_e)

    # Verify Section F (Provision)
    sec_f = data["section_f"]
    assert len(sec_f) >= 3
    assert any("25 hours" in f["quantified_support"] for f in sec_f)

    # Verify recommendations
    assert "recommendations" in data["senco_recommendations"].lower() or "senco" in data["senco_recommendations"].lower()


def test_get_annual_review_pack_not_found(client):
    client.post("/api/v1/auth/demo-login", json={"role": "senco"})
    fake_id = uuid.uuid4()
    resp = client.get(
        f"/api/v1/pupils/{fake_id}/annual-review-pack",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 404
