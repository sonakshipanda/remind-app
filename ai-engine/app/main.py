from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
from app.embeddings import get_embedding
from app.patterns import detect_pattern
from app.sentiment import analyze_sentiment
from app.nudges import generate_nudge
from app.insights import get_insights as compute_insights

app = FastAPI(
    title="REMIND AI Engine",
    description="AI-powered sentiment analysis, pattern detection, and nudge generation for regret entries.",
    version="1.0.0"
)


# ──────────────────────────────────────────────
# REQUEST MODELS (what the client sends us)
# ──────────────────────────────────────────────

class RegretEntry(BaseModel):
    """Basic request with a user ID and a single regret entry."""
    user_id: str = Field(..., example="user_123", description="Unique identifier for the user")
    entry: str = Field(..., example="I yelled at my brother for no reason", description="The regret entry text")

class AnalyzeRequest(BaseModel):
    """Full analysis request — includes past entries for pattern detection."""
    user_id: str = Field(..., example="user_123", description="Unique identifier for the user")
    entry: str = Field(..., example="I yelled at my brother for no reason", description="The new regret entry to analyze")
    past_entries: list[str] = Field(
        default=[],
        example=["I snapped at my roommate", "I yelled at my coworker", "I sent an angry text to my friend"],
        description="List of the user's previous regret entries (will come from database later)"
    )


# ──────────────────────────────────────────────
# RESPONSE MODELS (what we send back)
# ──────────────────────────────────────────────

class SentimentResponse(BaseModel):
    """Emotion analysis result for a single entry."""
    dominant_emotion: str = Field(..., example="anger", description="The strongest detected emotion")
    confidence: float = Field(..., example=0.894, description="Confidence score for the dominant emotion (0-1)")
    all_emotions: dict[str, float] = Field(
        ...,
        example={"anger": 0.894, "sadness": 0.06, "disgust": 0.03, "fear": 0.01, "joy": 0.003, "surprise": 0.002, "neutral": 0.001},
        description="Scores for all 7 emotions"
    )

class SimilarEntry(BaseModel):
    """A past entry that is similar to the new one."""
    entry: str = Field(..., example="I snapped at my roommate", description="The past entry text")
    similarity_score: float = Field(..., example=0.72, description="Cosine similarity score (0-1)")

class PatternResponse(BaseModel):
    """Pattern detection result — did we find recurring behavior?"""
    detected: bool = Field(..., example=True, description="Whether a pattern was detected (3+ similar entries)")
    similar_count: int = Field(..., example=3, description="Number of similar past entries found")
    similar_entries: list[SimilarEntry] = Field(
        default=[],
        description="List of similar past entries with their similarity scores"
    )

class NudgeResponse(BaseModel):
    """Nudge message generated when a pattern is detected."""
    nudge_triggered: bool = Field(..., example=True, description="Whether a nudge was generated")
    emotion_detected: Optional[str] = Field(None, example="anger", description="The emotion that triggered the nudge")
    emotion_confidence: Optional[float] = Field(None, example=0.894, description="Confidence of the detected emotion")
    similar_count: Optional[int] = Field(None, example=3, description="Number of similar past entries")
    urgency: Optional[str] = Field(None, example="medium", description="Urgency level: low, medium, or high")
    message: Optional[str] = Field(
        None,
        example="Pause. You've been here 3 times before — feeling angry and saying something you regretted. This is that moment.",
        description="The personalized nudge message"
    )
    suggestion: Optional[str] = Field(
        None,
        example="Try waiting 10 minutes before responding. Write out what you want to say, then re-read it.",
        description="Actionable suggestion for the user"
    )

class AnalyzeResponse(BaseModel):
    """Full analysis response — everything the backend needs for one entry."""
    user_id: str = Field(..., example="user_123", description="The user's ID (echoed back)")
    entry: str = Field(..., example="I yelled at my brother for no reason", description="The analyzed entry (echoed back)")
    embedding_size: int = Field(..., example=384, description="Dimension of the generated embedding vector")
    sentiment: SentimentResponse
    pattern: PatternResponse
    nudge: NudgeResponse

class PatternFullResponse(BaseModel):
    """Full pattern detection response (for the /patterns endpoint)."""
    new_entry: str = Field(..., example="I yelled at my brother for no reason", description="The new entry that was analyzed")
    similar_entries: list[SimilarEntry] = Field(default=[], description="Similar past entries found")
    pattern_detected: bool = Field(..., example=True, description="Whether a pattern was detected")
    similar_count: int = Field(..., example=3, description="Number of similar entries found")

class CategoryDetail(BaseModel):
    """Breakdown for a single category."""
    count: int = Field(..., example=3, description="Number of entries in this category")
    percentage: float = Field(..., example=37.5, description="Percentage of total entries")

class InsightsResponse(BaseModel):
    """Analytics and insights computed from all past entries."""
    user_id: str = Field(..., example="user_123", description="The user's ID")
    total_entries: int = Field(..., example=8, description="Total number of past entries analyzed")
    category_breakdown: dict[str, CategoryDetail] = Field(
        ...,
        description="Entry counts and percentages per category (communication, impulse, tone, silence)"
    )
    trigger_frequency: dict[str, int] = Field(
        ...,
        example={"sent": 2, "friend": 2, "snapped": 1},
        description="Most common trigger words across all entries"
    )
    trend_line: dict[str, int] = Field(
        ...,
        example={"2026-03-01": 1, "2026-03-03": 2},
        description="Number of entries per date (daily trend)"
    )

class StatusResponse(BaseModel):
    """Health check response."""
    message: str = Field(..., example="REMIND AI Service is running")


# ──────────────────────────────────────────────
# ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/", response_model=StatusResponse, tags=["Health"])
def root():
    """Health check — confirms the AI service is running."""
    return {"message": "REMIND AI Service is running"}


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze(data: AnalyzeRequest):
    """
    Full analysis pipeline for a regret entry.

    Runs the entry through all 4 stages:
    1. **Embedding** — converts text to a 384-dimensional vector (sentence-transformers)
    2. **Sentiment** — detects the dominant emotion (Hugging Face distilRoBERTa)
    3. **Pattern Detection** — finds similar past entries using cosine similarity
    4. **Nudge Generation** — creates a personalized reminder if a pattern is detected
    """
    # Step 1: Generate embedding (Keya)
    embedding = get_embedding(data.entry)

    # Step 2: Analyze sentiment (Sonakshi)
    sentiment = analyze_sentiment(data.entry)

    # Step 3: Detect patterns (Keya)
    pattern = detect_pattern(data.entry, data.past_entries)

    # Step 4: Generate nudge if pattern found (Sonakshi)
    nudge = generate_nudge(sentiment, pattern)

    return {
        "user_id": data.user_id,
        "entry": data.entry,
        "embedding_size": len(embedding),
        "sentiment": sentiment,
        "pattern": {
            "detected": pattern["pattern_detected"],
            "similar_count": pattern["similar_count"],
            "similar_entries": pattern["similar_entries"]
        },
        "nudge": nudge
    }


@app.post("/patterns", response_model=PatternFullResponse, tags=["Analysis"])
def get_patterns(data: AnalyzeRequest):
    """
    Pattern detection only — compares a new entry against past entries
    using cosine similarity to find recurring behavioral themes.
    """
    result = detect_pattern(data.entry, data.past_entries)
    return result


@app.post("/insights", response_model=InsightsResponse, tags=["Analytics"])
def get_insights(data: RegretEntry):
    """
    Computes analytics from a user's past entries:
    category breakdown, trigger word frequency, and daily trend line.
    """
    result = compute_insights(data.user_id)
    return result