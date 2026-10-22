def test_senco_child_registration_and_invitation(client):
    # 1. First ensure a school exists
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "St. Jude's Inclusive Academy",
            "school_reference": "SCH-TEST-REG",
            "town_city": "London",
            "postcode": "SE1 7PB",
        },
    )
    school_id = school_resp.json()["id"]

    # 2. SENCO registers a new pupil with SEND profile and Parent details
    reg_payload = {
        "first_name": "Archie",
        "last_name": "Watson",
        "preferred_name": "Archie",
        "date_of_birth": "2015-06-20",
        "sex": "Male",
        "year_group": "Year 5",
        "school_id": school_id,
        "primary_need": "Dyslexia & Processing",
        "secondary_need": "Working Memory",
        "has_ehcp": True,
        "ehcp_status": "Active",
        "summary": "Archie benefits from step-by-step verbal walkthrough and minimal visual clutter.",
        "communication_preferences": "Verbal instruction strip",
        "sensory_profile": "Prefers calm lighting and reduced visual noise",
        "strengths_interests": "Creative building, mechanics, oral storytelling",
        "baseline_strategy": "Step-by-step auditory walkthrough",
        "guardian_first_name": "Fiona",
        "guardian_last_name": "Watson",
        "guardian_email": "fiona.watson@example.com",
        "guardian_mobile": "07700 900555",
        "relationship_to_child": "Mother",
        "send_invitation_immediately": True,
    }

    # Pass SENCO role in header
    reg_resp = client.post(
        "/api/v1/registration/children",
        json=reg_payload,
        headers={"X-User-Role": "senco"},
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()

    assert reg_data["full_name"] == "Archie Watson"
    assert reg_data["invitation_token"] is not None
    assert reg_data["email_preview"] is not None
    assert "fiona.watson@example.com" in reg_data["email_preview"]["to_email"]
    assert "Welcome to See My Mind" in reg_data["email_preview"]["subject"]

    child_id = reg_data["child_id"]
    token = reg_data["invitation_token"]

    # 3. Test token validation endpoint
    val_resp = client.get(f"/api/v1/registration/invitations/{token}")
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["valid"] is True
    assert val_data["child_name"] == "Archie Watson"
    assert val_data["recipient_email"] == "fiona.watson@example.com"

    # 4. Test Parent accepts invitation and creates password
    accept_resp = client.post(
        "/api/v1/registration/accept-invitation",
        json={
            "token": token,
            "password": "SecureParentPassword123!",
            "full_name": "Fiona Watson",
        },
    )
    assert accept_resp.status_code == 200
    accept_data = accept_resp.json()
    assert accept_data["token_type"] == "bearer"
    assert accept_data["user"]["role"] == "parent"
    assert accept_data["user"]["email"] == "fiona.watson@example.com"

    # 5. Token is now consumed; validating again should return valid = False
    reval_resp = client.get(f"/api/v1/registration/invitations/{token}")
    assert reval_resp.json()["valid"] is False

    # 6. Parent sets up Child's voice account with PIN
    child_acc_resp = client.post(
        f"/api/v1/registration/children/{child_id}/setup-child-account",
        json={
            "child_id": child_id,
            "username": "archie-w",
            "pin": "1234",
            "avatar_emoji": "🚀",
        },
        headers={"X-User-Role": "parent"},
    )
    assert child_acc_resp.status_code == 201
    child_acc_data = child_acc_resp.json()
    assert child_acc_data["username"] == "archie-w"
    assert child_acc_data["avatar_emoji"] == "🚀"


def test_rbac_child_registration_forbidden_for_non_senco(client):
    # Parents and TAs should NOT be able to register children
    resp = client.post(
        "/api/v1/registration/children",
        json={
            "first_name": "Unauthorized",
            "last_name": "Attempt",
            "date_of_birth": "2015-01-01",
            "guardian_first_name": "Test",
            "guardian_last_name": "Test",
            "guardian_email": "test@example.com",
        },
        headers={"X-User-Role": "parent"},
    )
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]


def test_resend_email_dispatch_and_fallback(client, monkeypatch):
    from unittest.mock import MagicMock

    from app.core.config import settings

    # Ensure school exists
    school_resp = client.post(
        "/api/v1/schools/",
        json={
            "school_name": "St. Jude's Inclusive Academy",
            "school_reference": "SCH-RESEND-TEST",
            "town_city": "London",
            "postcode": "SE1 7PB",
        },
    )
    school_id = school_resp.json()["id"]

    # 1. Mock Resend HTTP POST response
    mock_post = MagicMock()
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"id": "resend_test_msg_888"}

    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_dummy_key_123")
    monkeypatch.setattr("httpx.Client.post", mock_post)

    resp = client.post(
        "/api/v1/registration/children",
        json={
            "first_name": "Leo",
            "last_name": "Davies",
            "date_of_birth": "2016-03-12",
            "school_id": school_id,
            "guardian_first_name": "Mark",
            "guardian_last_name": "Davies",
            "guardian_email": "mark.davies@example.com",
            "send_invitation_immediately": True,
        },
        headers={"X-User-Role": "senco"},
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["email_preview"] is not None
    assert data["email_preview"]["delivery_channel"] == "resend"
    assert data["email_preview"]["external_id"] == "resend_test_msg_888"

    # 2. Test fallback when no Resend key is set
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    resp2 = client.post(
        "/api/v1/registration/children",
        json={
            "first_name": "Maya",
            "last_name": "Lin",
            "date_of_birth": "2016-07-22",
            "school_id": school_id,
            "guardian_first_name": "Lin",
            "guardian_last_name": "Wei",
            "guardian_email": "lin.wei@example.com",
            "send_invitation_immediately": True,
        },
        headers={"X-User-Role": "senco"},
    )
    assert resp2.status_code == 201
    data2 = resp2.json()
    assert data2["email_preview"]["delivery_channel"] == "preview"
    assert data2["email_preview"]["external_id"] is None

