from fastapi import APIRouter

from app.api.v1.endpoints import health, noya, pupils, schools, timeline, transitions

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(schools.router, prefix="/schools", tags=["Schools"])
api_router.include_router(pupils.router, prefix="/pupils", tags=["Pupils"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["Transactional Spine"])
api_router.include_router(
    transitions.router, prefix="/transitions", tags=["Transitions & Handovers"]
)
api_router.include_router(noya.router, prefix="/noya", tags=["NOYA AI & RAG Engine"])
