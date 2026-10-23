def test_admin_demo_login(client):
    """Test 1-click demo login as Trust & Platform Admin."""
    resp = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["full_name"] == "Dr. Alistair Vance"


def test_trust_stats(client):
    """Test retrieving trust-wide governance statistics."""
    # First authenticate as admin
    login_resp = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-User-Role": "admin"}

    resp = client.get("/api/v1/admin/stats", headers=headers)
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_schools"] >= 1
    assert "KCSIE & GDPR" in stats["compliance_score"]
    assert stats["lead_trust_admin"] == "Dr. Alistair Vance"


def test_list_and_onboard_school(client):
    """Test onboarding a new school tenant and listing schools."""
    login_resp = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-User-Role": "admin"}

    # Onboard a unique test school
    new_school = {
        "school_name": "Highland Park Academy",
        "urn_number": "URN-994812",
        "phase": "All-through",
        "local_authority": "Southwark",
        "lead_senco_name": "Dr Marcus Thorne",
        "town_city": "London",
        "postcode": "SE15 4TY",
        "main_email": "admin@highlandpark.sch.uk",
    }
    create_resp = client.post("/api/v1/admin/schools", json=new_school, headers=headers)
    assert create_resp.status_code == 201
    school_data = create_resp.json()
    assert school_data["school_name"] == "Highland Park Academy"
    assert school_data["urn_number"] == "URN-994812"
    assert school_data["phase"] == "All-through"

    # List schools and verify it's there
    list_resp = client.get("/api/v1/admin/schools", headers=headers)
    assert list_resp.status_code == 200
    schools = list_resp.json()
    assert any(s["urn_number"] == "URN-994812" for s in schools)


def test_provision_staff_and_appoint_senco(client):
    """Test provisioning a new staff member and appointing them as Lead SENCO."""
    login_resp = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-User-Role": "admin"}

    # Get a school to provision for
    schools_resp = client.get("/api/v1/admin/schools", headers=headers)
    assert schools_resp.status_code == 200
    school_id = schools_resp.json()[0]["id"]

    staff_payload = {
        "first_name": "Eleanor",
        "last_name": "Rigby",
        "email": "eleanor.rigby@test-school.sch.uk",
        "role": "senco",
        "school_id": school_id,
        "job_title": "Director of Inclusion & SENCO",
    }
    resp = client.post("/api/v1/admin/users", json=staff_payload, headers=headers)
    assert resp.status_code == 201
    user_data = resp.json()
    assert user_data["full_name"] == "Eleanor Rigby"
    assert user_data["role"] == "senco"
    assert "INV-" in user_data["invitation_token"]

    # Verify audit log was recorded for this appointment
    audit_resp = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert any(
        log["action"] == "APPOINT_SENCO" and "Eleanor Rigby" in log["details"]
        for log in logs
    )


def test_data_segregation_and_tenant_boundary(client):
    """Verify that a non-admin role (e.g. teacher or unauthenticated) cannot onboard schools."""
    # Teacher login
    teacher_login = client.post("/api/v1/auth/demo-login", json={"role": "teacher"})
    teacher_token = teacher_login.json()["access_token"]
    teacher_headers = {"Authorization": f"Bearer {teacher_token}", "X-User-Role": "teacher"}

    # Teacher attempts to onboard a school -> Expect 403 Forbidden
    hack_school = {
        "school_name": "Unauthorized School",
        "urn_number": "URN-000000",
        "phase": "Primary",
    }
    resp = client.post("/api/v1/admin/schools", json=hack_school, headers=teacher_headers)
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]


def test_delegation_matrix_endpoint(client):
    """Verify delegation matrix returns all persona tiers."""
    resp = client.get("/api/v1/admin/delegation-matrix")
    assert resp.status_code == 200
    matrix = resp.json()
    roles = [m["role_key"] for m in matrix]
    assert "admin" in roles
    assert "senco" in roles
    assert "teacher" in roles
    assert "ta" in roles
    assert "parent" in roles
    assert "child" in roles


def test_senco_can_provision_teacher_and_ta(client):
    """Test that SENCO can provision teachers and TAs at their assigned school."""
    # Authenticate as SENCO
    senco_login = client.post("/api/v1/auth/demo-login", json={"role": "senco"})
    assert senco_login.status_code == 200
    senco_token = senco_login.json()["access_token"]
    senco_headers = {"Authorization": f"Bearer {senco_token}", "X-User-Role": "senco"}

    # 1. Provision a classroom teacher
    teacher_payload = {
        "first_name": "Thomas",
        "last_name": "Clarke",
        "email": "t.clarke@stjudes.sch.uk",
        "role": "teacher",
        "job_title": "Year 4 Class Teacher",
    }
    resp = client.post("/api/v1/admin/users", json=teacher_payload, headers=senco_headers)
    assert resp.status_code == 201
    created_teacher = resp.json()
    assert created_teacher["full_name"] == "Thomas Clarke"
    assert created_teacher["role"] == "teacher"
    assert created_teacher["job_title"] == "Year 4 Class Teacher"

    # 2. Provision a Teaching Assistant (TA)
    ta_payload = {
        "first_name": "Sarah",
        "last_name": "O'Connor",
        "email": "s.oconnor@stjudes.sch.uk",
        "role": "ta",
        "job_title": "1:1 Autism & Sensory Support Assistant",
    }
    ta_resp = client.post("/api/v1/admin/users", json=ta_payload, headers=senco_headers)
    assert ta_resp.status_code == 201
    created_ta = ta_resp.json()
    assert created_ta["full_name"] == "Sarah O'Connor"
    assert created_ta["role"] == "ta"

    # 3. Verify audit trail captured the action with SENCO actor
    admin_login = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}", "X-User-Role": "admin"}
    audit_resp = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert any(
        log["action"] == "SENCO_PROVISION_STAFF" and "Thomas Clarke" in log["details"]
        for log in logs
    )


def test_senco_cannot_provision_admin_or_cross_school(client):
    """Test security boundaries: SENCO cannot provision Admin accounts or staff at foreign schools."""
    senco_login = client.post("/api/v1/auth/demo-login", json={"role": "senco"})
    assert senco_login.status_code == 200
    senco_token = senco_login.json()["access_token"]
    senco_headers = {"Authorization": f"Bearer {senco_token}", "X-User-Role": "senco"}

    # 1. Attempt to provision an Admin account -> 403 Forbidden
    admin_payload = {
        "first_name": "Evil",
        "last_name": "Admin",
        "email": "evil.admin@unauthorized.org",
        "role": "admin",
        "job_title": "Unauthorized Admin",
    }
    resp = client.post("/api/v1/admin/users", json=admin_payload, headers=senco_headers)
    assert resp.status_code == 403
    assert "not authorized to provision Admin accounts" in resp.json()["detail"]

    # 2. Attempt to provision staff at a foreign school_id -> 403 Forbidden
    import uuid
    foreign_school_id = str(uuid.uuid4())
    cross_school_payload = {
        "first_name": "Foreign",
        "last_name": "Teacher",
        "email": "foreign.teacher@external.org",
        "role": "teacher",
        "school_id": foreign_school_id,
        "job_title": "External Teacher",
    }
    resp_cross = client.post("/api/v1/admin/users", json=cross_school_payload, headers=senco_headers)
    assert resp_cross.status_code == 403
    assert "only provision staff for their assigned school" in resp_cross.json()["detail"]
