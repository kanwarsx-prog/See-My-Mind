from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    child_id: UUID
    school_id: UUID | None = None
    title: str
    document_type: str  # EHCP, Annual Review, EP Report, Speech Therapy
    storage_path: str
    file_size_bytes: int | None = None
    mime_type: str | None = "application/pdf"
    is_indexed: bool
    created_at: datetime
