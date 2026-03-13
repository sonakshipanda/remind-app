from transformers import pipeline

# Load the pre-trained emotion classifier
# Downloads on first run (~300MB), then caches locally
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None  # returns scores for ALL emotions, not just the top one
)

def analyze_sentiment(text: str):
    """
    Analyze the emotional tone of a regret entry.
    
    Input: "I screamed at my sister over something stupid"
    Output: {
        "dominant_emotion": "anger",
        "confidence": 0.87,
        "all_emotions": {"anger": 0.87, "sadness": 0.06, ...}
    }
    """
    # Run the model on the text
    results = classifier(text)[0]
    
    # Convert to a clean dictionary: {"anger": 0.87, "sadness": 0.06, ...}
    emotion_scores = {r["label"]: round(r["score"], 4) for r in results}
    
    # Find the dominant emotion (highest score)
    dominant = max(emotion_scores, key=emotion_scores.get)
    
    return {
        "dominant_emotion": dominant,
        "confidence": emotion_scores[dominant],
        "all_emotions": emotion_scores
    }
