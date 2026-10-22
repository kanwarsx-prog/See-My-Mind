import io
from datetime import date


def test_document_upload_and_retrieval(client):
    # 1. Setup school and child
    school_resp = client.post(
        "/api/v1/schools/",
        json={"school_name": "St. Jude's Academy", "school_reference": "SCH-DOC-1"},
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

    # 2. Upload sample EHCP document
    pdf_content = b"%PDF-1.4 Mock Statutory EHCP Document Content for Testing"
    files = {"file": ("phoenix_ehcp_2026.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {
        "child_id": str(child_id),
        "title": "Phoenix Carter - Final Statutory EHCP 2026",
        "document_type": "EHCP",
    }

    upload_resp = client.post("/api/v1/documents/upload", data=data, files=files)
    assert upload_resp.status_code == 201
    doc_data = upload_resp.json()
    assert doc_data["title"] == "Phoenix Carter - Final Statutory EHCP 2026"
    assert doc_data["document_type"] == "EHCP"
    assert doc_data["file_size_bytes"] == len(pdf_content)
    doc_id = doc_data["id"]

    # 3. List documents for child
    list_resp = client.get(f"/api/v1/documents/children/{child_id}")
    assert list_resp.status_code == 200
    docs = list_resp.json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id

    # 4. Download document
    dl_resp = client.get(f"/api/v1/documents/{doc_id}/download")
    assert dl_resp.status_code == 200
    assert dl_resp.content == pdf_content
