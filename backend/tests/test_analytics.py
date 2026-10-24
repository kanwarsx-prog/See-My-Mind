def test_analytics_overview(client):
    resp = client.get(
        "/api/v1/analytics/overview",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["school_name"] == "St. Jude's Inclusive Academy"
    assert data["total_send_pupils"] >= 10
    assert data["ehcp_count"] >= 1
    assert data["provision_delivery_rate"] > 90.0
    assert data["overall_de_escalation_win_rate"] > 80.0
    assert "Wednesdays" in data["peak_vulnerability_window"]


def test_incident_heatmap(client):
    resp = client.get(
        "/api/v1/analytics/incidents/heatmap",
        headers={"X-User-Role": "ta"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["days"]) == 5
    assert len(data["day_keys"]) == 5
    assert len(data["periods"]) == 7
    assert data["total_incidents"] > 0
    assert "peak_window" in data

    # Check period structure
    first_period = data["periods"][0]
    assert "period_id" in first_period
    assert "incident_counts" in first_period
    assert "mon" in first_period["incident_counts"]


def test_trigger_frequencies(client):
    resp = client.get(
        "/api/v1/analytics/incidents/triggers",
        headers={"X-User-Role": "teacher"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_recorded_triggers"] > 0
    assert len(data["triggers"]) >= 4

    top_trigger = data["triggers"][0]
    assert "Acoustic" in top_trigger["label"] or "Sensory" in top_trigger["label"]
    assert top_trigger["percentage"] > 20.0
    assert len(top_trigger["primary_antecedent_examples"]) >= 1


def test_strategy_win_rates(client):
    resp = client.get(
        "/api/v1/analytics/strategies/win-rates",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_win_rate"] > 80.0
    assert data["total_strategies_evaluated"] >= 5

    # Check top strategy
    strat_titles = [s["title"] for s in data["strategies"]]
    assert any("Movement" in t for t in strat_titles)
    assert any("Acoustic Shelter" in t for t in strat_titles)

    # Check low-efficacy contrast
    verbal_strat = next((s for s in data["strategies"] if "Direct Verbal" in s["title"]), None)
    assert verbal_strat is not None
    assert verbal_strat["win_rate_percentage"] < 50.0


def test_provision_audit(client):
    resp = client.get(
        "/api/v1/analytics/provision/audit",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "£148,600" in data["total_high_needs_funding"]
    assert data["total_allocated_ta_hours"] >= 150.0
    assert data["overall_compliance_rate"] > 90.0
    assert len(data["bands"]) == 4


def test_export_analytics_csv(client):
    resp = client.get(
        "/api/v1/analytics/export/csv?report_type=provision",
        headers={"X-User-Role": "senco"},
    )
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "attachment; filename=seemy-mind-provision-audit.csv" in resp.headers["content-disposition"]
    csv_text = resp.text
    assert "SEE MY MIND - STATUTORY PROVISION & HIGH NEEDS FUNDING AUDIT" in csv_text
    assert "Band 4" in csv_text


def test_analytics_rbac_protection(client):
    # Parents and children should not access school-wide provision audit
    resp_parent = client.get(
        "/api/v1/analytics/provision/audit",
        headers={"X-User-Role": "parent"},
    )
    assert resp_parent.status_code == 403

    resp_child = client.get(
        "/api/v1/analytics/overview",
        headers={"X-User-Role": "child"},
    )
    assert resp_child.status_code == 403
