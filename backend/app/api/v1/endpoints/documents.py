from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ai_noya import RAGSourceDocument
from app.schemas.document import DocumentResponse
from app.services.storage_service import StorageService

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_child_document(
    child_id: UUID = Form(...),
    title: str = Form(...),
    document_type: str = Form("EHCP"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload an official SEND document (EHCP, Annual Review, Educational Psychologist Report)."""
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        doc = StorageService.save_document(
            db=db,
            child_id=child_id,
            title=title,
            document_type=document_type,
            filename=file.filename or "document.pdf",
            file_bytes=content,
            mime_type=file.content_type or "application/pdf",
        )
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/children/{child_id}", response_model=list[DocumentResponse])
def get_child_documents(child_id: UUID, db: Session = Depends(get_db)):
    """List all statutory documents stored for a pupil."""
    return StorageService.get_documents_by_child(db, child_id)


@router.get("/{document_id}/download")
def download_child_document(document_id: UUID, db: Session = Depends(get_db)):
    """Download an uploaded SEND document by ID."""
    doc = db.query(RAGSourceDocument).filter(RAGSourceDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    file_path = StorageService.get_document_file_path(doc)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on storage disk.")

    return FileResponse(
        path=file_path,
        media_type=doc.mime_type or "application/pdf",
        filename=f"{doc.title}.pdf",
    )
