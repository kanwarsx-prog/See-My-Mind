from uuid import UUID

from pydantic import BaseModel


class EvidenceCitation(BaseModel):
    citation_text: str
    snippet: str | None = None
    event_id: UUID | None = None
    chunk_id: UUID | None = None


class MorningBriefingResponse(BaseModel):
    child_id: UUID
    child_name: str
    briefing_date: str
    summary_markdown: str
    recommended_focus: list[str]
    citations: list[EvidenceCitation]
    confidence_level: str = "High"


class AskNoyaRequest(BaseModel):
    child_id: UUID
    question: str
    top_k: int = 5


class AskNoyaResponse(BaseModel):
    question: str
    answer_markdown: str
    citations: list[EvidenceCitation]
    model_used: str
    latency_ms: int
