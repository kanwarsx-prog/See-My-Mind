def test_get_camhs_clinical_dossier(client):
    # 1. Create a school
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "St. Jude's Inclusive Academy",
            "school_reference": "SCH-CAMHS-1",
            "town_city": "London",
            "postcode": "SE1 7PB",
            "main_email": "admin@stjudes.sch.uk",
        },
    )
    assert school_resp.status_code == 201
    school_id = school_resp.json()["id"]

    # 2. Create pupil
    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Phoenix",
            "last_name": "Carter",
            "preferred_name": "Phoenix",
            "date_of_birth": "2015-04-12",
            "sex": "Male",
            "year_group": "Year 5",
            "school_id": school_id,
            "primary_need": "Autism Spectrum Condition & ADHD",
            "has_ehcp": True,
        },
    )
    assert child_resp.status_code == 201
    child_id = child_resp.json()["id"]

    # 3. Request CAMHS Dossier as Parent
    resp = client.get(
        f"/api/v1/analytics/camhs-dossier/{child_id}",
        headers={"X-User-Role": "parent"},
    )
    assert resp.status_code == 200, f"Error: {resp.status_code} - {resp.text}"
    data = resp.json()

    # Patient Header
    hdr = data["patient_header"]
    assert hdr["full_name"] == "Phoenix Carter"
    assert hdr["preferred_name"] == "Phoenix"
    assert "NHS-" in hdr["nhs_number"]
    assert "CAMHS" in hdr["referring_clinic"]
    assert "St. Jude's" in hdr["school_name"]

    # Medication Titration Audit
    med = data["medication_audit"]
    assert "Equasym XL" in med["medication_name"]
    assert "18mg" in med["dosage"]
    assert "10:15 - 10:45 AM" in med["mid_morning_dip_window"]
    assert "16:1" in med["fasted_vs_fed_incident_ratio"]

    # Cross-Setting Concordance (NICE NG87 / CG128)
    csc = data["cross_setting_concordance"]
    assert len(csc) == 4
    domains = [c["domain"] for c in csc]
    assert "Sustained Attention & Executive Function" in domains
    assert "Emotional Regulation & Masking Profile" in domains

    masking_domain = next(c for c in csc if "Emotional Regulation" in c["domain"])
    assert masking_domain["concordance_level"] == "Masked at School"
    assert "Restraint collapse" in masking_domain["home_presentation"]

    # Sensory Environment & Behavioural Safety
    sens = data["sensory_environment_audit"]
    assert len(sens["primary_sensory_triggers"]) >= 3
    assert sens["average_latency_to_de_escalate_minutes"] < 10.0
    assert sens["fixed_or_permanent_exclusions"] == 0

    # Restraint Collapse Analysis
    rc = data["restraint_collapse_analysis"]
    assert rc["masking_index_score"] == 82
    assert "autonomic crash" in rc["autonomic_depletion_mechanism"].lower()

    # Clinical Recommendations & Statutory Anchors
    recs = data["clinical_recommendations"]
    assert len(recs) >= 3
    anchors = [r["statutory_anchor"] for r in recs]
    assert any("NICE NG87" in a for a in anchors)
    assert any("Section F" in a for a in anchors)


def test_camhs_dossier_rbac_guards(client):
    # Create child
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "St. Jude's Inclusive Academy",
            "school_reference": "SCH-CAMHS-2",
            "town_city": "London",
            "postcode": "SE1 7PB",
            "main_email": "admin2@stjudes.sch.uk",
        },
    )
    school_id = school_resp.json()["id"]

    child_resp = client.post(
        "/api/v1/pupils/",
        json={
            "first_name": "Phoenix",
            "last_name": "Carter",
            "date_of_birth": "2015-04-12",
            "school_id": school_id,
            "primary_need": "ASC",
        },
    )
    child_id = child_resp.json()["id"]

    # SENCO can access
    resp_senco = client.get(
        f"/api/v1/analytics/camhs-dossier/{child_id}",
        headers={"X-User-Role": "senco"},
    )
    assert resp_senco.status_code == 200, f"Error: {resp_senco.status_code} - {resp_senco.text}"

    # Teacher can access
    resp_teacher = client.get(
        f"/api/v1/analytics/camhs-dossier/{child_id}",
        headers={"X-User-Role": "teacher"},
    )
    assert resp_teacher.status_code == 200, f"Error: {resp_teacher.status_code} - {resp_teacher.text}"

    # Child cannot access (safeguarded medical document)
    resp_child = client.get(
        f"/api/v1/analytics/camhs-dossier/{child_id}",
        headers={"X-User-Role": "child"},
    )
    assert resp_child.status_code == 403
