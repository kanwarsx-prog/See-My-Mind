from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.rag_service import NoyaRAGService
from app.core.database import get_db
from app.schemas.ai import AskNoyaRequest, AskNoyaResponse, MorningBriefingResponse

router = APIRouter()


@router.post("/morning-briefing/{child_id}", response_model=MorningBriefingResponse)
def generate_morning_briefing(child_id: UUID, db: Session = Depends(get_db)):
    """Generate NOYA's 3-bullet Morning Transition Briefing for classroom staff."""
    try:
        return NoyaRAGService.generate_morning_briefing(db=db, child_id=child_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NOYA generation failed: {e!s}")


@router.post("/ask", response_model=AskNoyaResponse)
def ask_noya(request: AskNoyaRequest, db: Session = Depends(get_db)):
    """Ask NOYA an advisory question grounded in pupil timeline logs and EHCP evidence."""
    try:
        return NoyaRAGService.ask_noya(
            db=db, child_id=request.child_id, question=request.question, top_k=request.top_k
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NOYA RAG failed: {e!s}")
