from sklearn.metrics.pairwise import cosine_similarity
from app.embeddings import get_embedding

# Similarity threshold: how similar two entries need to be to count as related
SIMILARITY_THRESHOLD = 0.4

# Minimum number of similar entries to confirm a pattern
PATTERN_THRESHOLD = 3

def detect_pattern(new_entry: str, past_entries: list):
    """
    Compares a new entry against past entries to detect recurring patterns.
    Input: new entry text, list of the past entry texts
    Output: dictionary with pattern detection results
    """
    
    # Step 1: Get embedding for the new entry
    new_embedding = get_embedding(new_entry)

    # Step 2: Compare against each past entry
    similar_entries = []

    for past_entry in past_entries:
        # Get embedding for past entry
        past_embedding = get_embedding(past_entry)

        # Calculate the cosine similarity score
        score = cosine_similarity([new_embedding], [past_embedding])[0][0]

        # If score is high enough, count it as similar
        if score >= SIMILARITY_THRESHOLD:
            similar_entries.append({
                "entry": past_entry,
                "similarity_score": round(float(score), 3)
            })

    # Step 3: Check if enough similar entries exist for a pattern
    pattern_detected = len(similar_entries) >= PATTERN_THRESHOLD

    # Step 4: Return the results
    return{
        "new_entry": new_entry,
        "similar_entries": similar_entries,
        "pattern_detected": pattern_detected,
        "similar_count": len(similar_entries)
    }
