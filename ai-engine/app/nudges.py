def generate_nudge(sentiment_result: dict, pattern_result: dict):
    """
    Generate a personalized nudge message when a pattern is detected.
    
    Takes in:
      - sentiment_result: output from sentiment.py (dominant_emotion, confidence)
      - pattern_result: output from patterns.py (similar_entries, pattern_detected, similar_count)
    
    Returns:
      - nudge dict with message, urgency level, and suggestions
    """
    
    # If no pattern detected, no nudge needed
    if not pattern_result["pattern_detected"]:
        return {
            "nudge_triggered": False,
            "message": None,
            "urgency": None,
            "suggestion": None
        }
    
    emotion = sentiment_result["dominant_emotion"]
    confidence = sentiment_result["confidence"]
    similar_count = pattern_result["similar_count"]
    
    # --- Build the nudge message based on emotion ---
    
    emotion_messages = {
        "anger": {
            "message": f"Pause. You've been here {similar_count} times before — feeling angry and saying something you regretted. This is that moment.",
            "suggestion": "Try waiting 10 minutes before responding. Write out what you want to say, then re-read it."
        },
        "sadness": {
            "message": f"You've felt this sadness {similar_count} times before in similar situations, and each time you wished you'd handled it differently.",
            "suggestion": "Before reacting, ask yourself: will this matter in a week? Talk to someone you trust first."
        },
        "disgust": {
            "message": f"You've reacted with frustration like this {similar_count} times before. Each time, you wished you'd been kinder.",
            "suggestion": "Try reframing: what would you say if you were giving advice to a friend in this situation?"
        },
        "fear": {
            "message": f"This anxiety has come up {similar_count} times before. Last time, rushing to respond made it worse.",
            "suggestion": "Take a breath. You don't have to respond right now. Give yourself permission to wait."
        },
        "joy": {
            "message": f"You're feeling good, but {similar_count} past entries show that excitement sometimes led to oversharing or over-promising.",
            "suggestion": "Enjoy the moment, but sleep on any big commitments before making them."
        },
        "surprise": {
            "message": f"You've been caught off guard like this {similar_count} times. Reacting in the moment didn't go well before.",
            "suggestion": "It's okay to say 'let me think about that' instead of responding immediately."
        },
        "neutral": {
            "message": f"This situation matches {similar_count} past entries. Even though you feel calm now, the pattern suggests it could escalate.",
            "suggestion": "Stay mindful. Check in with yourself in an hour."
        }
    }
    
    # Get the message for this emotion (fallback to neutral if unknown)
    nudge_content = emotion_messages.get(emotion, emotion_messages["neutral"])
    
    # --- Determine urgency based on confidence + similar count ---
    
    if confidence > 0.8 and similar_count >= 5:
        urgency = "high"
    elif confidence > 0.6 and similar_count >= 3:
        urgency = "medium"
    else:
        urgency = "low"
    
    return {
        "nudge_triggered": True,
        "emotion_detected": emotion,
        "emotion_confidence": round(confidence, 3),
        "similar_count": similar_count,
        "urgency": urgency,
        "message": nudge_content["message"],
        "suggestion": nudge_content["suggestion"]
    }


# Test it
if __name__ == "__main__":
    # Simulating what sentiment.py would return
    fake_sentiment = {
        "dominant_emotion": "anger",
        "confidence": 0.894,
        "all_emotions": {"anger": 0.894, "sadness": 0.06, "disgust": 0.03, "fear": 0.01, "joy": 0.003, "surprise": 0.002, "neutral": 0.001}
    }
    
    # Simulating what patterns.py would return (pattern found)
    fake_pattern_found = {
        "new_entry": "I yelled at my brother for no reason",
        "similar_entries": [
            {"entry": "I snapped at my roommate", "similarity_score": 0.72},
            {"entry": "I yelled at my coworker", "similarity_score": 0.68},
            {"entry": "I sent an angry text to my friend", "similarity_score": 0.55}
        ],
        "pattern_detected": True,
        "similar_count": 3
    }
    
    # Simulating no pattern found
    fake_pattern_none = {
        "new_entry": "I ate too much pizza",
        "similar_entries": [],
        "pattern_detected": False,
        "similar_count": 0
    }
    
    print("=== Test 1: Pattern detected (anger) ===")
    result = generate_nudge(fake_sentiment, fake_pattern_found)
    print(f"  Nudge: {result['nudge_triggered']}")
    print(f"  Urgency: {result['urgency']}")
    print(f"  Message: {result['message']}")
    print(f"  Suggestion: {result['suggestion']}")
    
    print("\n=== Test 2: No pattern ===")
    result = generate_nudge(fake_sentiment, fake_pattern_none)
    print(f"  Nudge: {result['nudge_triggered']}")
    print(f"  Message: {result['message']}")