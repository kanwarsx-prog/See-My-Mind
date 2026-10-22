import os
from pathlib import Path
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.ai_noya import RAGSourceDocument
from app.models.pupil import Child

STORAGE_DIR = Path(__file__).resolve().parent.parent / "uploads"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    @staticmethod
    def save_document(
        db: Session,
        child_id: UUID,
        title: str,
        document_type: str,
        filename: str,
        file_bytes: bytes,
        mime_type: str = "application/pdf",
    ) -> RAGSourceDocument:
        # Check child exists
        child = db.query(Child).filter(Child.id == child_id).first()
        school_id = child.school_id if child else None

        # Clean filename & path
        safe_name = os.path.basename(filename).replace(" ", "_")
        storage_rel_path = f"{child_id}/{uuid4().hex[:8]}_{safe_name}"
        full_dest = STORAGE_DIR / storage_rel_path
        full_dest.parent.mkdir(parents=True, exist_ok=True)

        with open(full_dest, "wb") as f:
            f.write(file_bytes)

        doc = RAGSourceDocument(
            child_id=child_id,
            school_id=school_id,
            title=title,
            document_type=document_type,
            storage_path=str(storage_rel_path),
            file_size_bytes=len(file_bytes),
            mime_type=mime_type,
            is_indexed=False,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_documents_by_child(db: Session, child_id: UUID) -> list[RAGSourceDocument]:
        return (
            db.query(RAGSourceDocument)
            .filter(RAGSourceDocument.child_id == child_id)
            .order_by(RAGSourceDocument.created_at.desc())
            .all()
        )

    @staticmethod
    def get_document_file_path(doc: RAGSourceDocument) -> Path:
        return STORAGE_DIR / doc.storage_path
