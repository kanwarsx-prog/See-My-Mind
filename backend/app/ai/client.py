from openai import OpenAI

from app.core.config import settings

_client: OpenAI | None = None


def get_openai_client() -> OpenAI | None:
    global _client
    if not settings.OPENAI_API_KEY:
        return None
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def generate_embedding(text: str) -> list[float]:
    """Generates a 1536-dim vector embedding using OpenAI text-embedding-3-small."""
    client = get_openai_client()
    if not client:
        # Return a zero vector mock in environments without active API keys
        return [0.0] * settings.EMBEDDING_DIMENSION

    response = client.embeddings.create(input=text, model=settings.OPENAI_EMBEDDING_MODEL)
    return response.data[0].embedding
