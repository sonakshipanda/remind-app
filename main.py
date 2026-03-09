from fastapi import FastAPI
from pydantic import BaseModel
from app.embeddings import get_embedding
from app.patterns import detect_pattern

app = FastAPI()

class RegretEntry(BaseModel):
    user_id: str
    entry: str

@app.get("/")
def root():
    return {"message": "REMIND AI Service is running"}

@app.post("/analyze")
def analyze(data: RegretEntry):
    # Now actually generates a real embedding
    embedding = get_embedding(data.entry)
    return {
        "user_id": data.user_id,
        "entry": data.entry,
        "embedding": embedding,
        "embedding_size": len(embedding)
    }

@app.post("/patterns")
def get_patterns(data: RegretEntry):

    # Simulated past entries (will come from the database later)
    past_entries = [
        "I snapped at my roommate",
        "I yelled at my coworker",
        "I sent an angry text to my friend",
        "I ate junk food again",
        "I stayed up way too late"
    ]
    
    result = detect_pattern(data.entry, past_entries)
    return result


@app.post("/insights")
def get_insights(data: RegretEntry):
    return {"user_id": data.user_id, "status": "insights coming soon"}


