def test_get_statutory_sen_information_report(client):
    resp = client.get(
        "/api/v1/analytics/governor-report",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()

    # 1. Statutory Header
    header = data["header"]
    assert header["school_name"] == "St. Jude's Inclusive Academy"
    assert "Sarah Davies" in header["lead_senco"]
    assert "NASENCo" in header["senco_qualifications"]
    assert "NPQH" in header["headteacher"]
    assert "Governor" in header["send_governor"]

    # 2. Caseload Demographics across 4 Code of Practice Areas
    demographics = data["demographics"]
    assert demographics["total_send_count"] == 34
    assert demographics["ehcp_count"] == 12
    assert demographics["sen_support_count"] == 22
    assert len(demographics["needs_distribution"]) == 4

    cop_areas = [d["code_of_practice_area"] for d in demographics["needs_distribution"]]
    assert "Communication and Interaction" in cop_areas
    assert "Cognition and Learning" in cop_areas
    assert "Social, Emotional and Mental Health (SEMH)" in cop_areas
    assert "Sensory and/or Physical Needs" in cop_areas

    # 3. Provision & High Needs Funding
    prov = data["provision_audit"]
    assert prov["total_high_needs_funding"] == "£148,600"
    assert prov["weekly_ta_hours_allocated"] == 185.0
    assert prov["weekly_ta_hours_delivered"] == 178.0
    assert prov["statutory_delivery_compliance_rate"] == 96.2
    assert len(prov["band_breakdown"]) == 4

    # 4. Empirical Efficacy & Behavioural Safety
    eff = data["efficacy"]
    assert eff["de_escalation_win_rate"] > 80.0
    assert eff["fixed_term_exclusions"] == 0
    assert eff["permanent_exclusions"] == 0
    assert eff["average_attendance_rate"] > 90.0
    assert len(eff["top_effective_strategies"]) >= 3

    # 5. Annual Review Compliance
    arc = data["annual_review_compliance"]
    assert arc["annual_reviews_due_this_year"] == 12
    assert arc["overdue_reviews"] == 0
    assert arc["statutory_compliance_rate"] == 100.0

    # 6. Strategic Commentary & Declaration
    assert len(data["senco_strategic_commentary"]) > 50
    assert len(data["priorities_for_next_year"]) == 4
    assert "Section 69" in data["governance_declaration"]


def test_governor_report_rbac_guards(client):
    # Admin can access
    resp_admin = client.get(
        "/api/v1/analytics/governor-report",
        headers={"X-User-Role": "admin"},
    )
    assert resp_admin.status_code == 200

    # Non-leadership roles cannot access confidential governor pack
    resp_teacher = client.get(
        "/api/v1/analytics/governor-report",
        headers={"X-User-Role": "teacher"},
    )
    assert resp_teacher.status_code == 403

    resp_ta = client.get(
        "/api/v1/analytics/governor-report",
        headers={"X-User-Role": "ta"},
    )
    assert resp_ta.status_code == 403

    resp_parent = client.get(
        "/api/v1/analytics/governor-report",
        headers={"X-User-Role": "parent"},
    )
    assert resp_parent.status_code == 403
