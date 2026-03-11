from collections import Counter
from datetime import datetime

# Simulated past entries with categories and dates
# In production these will come from the database
SAMPLE_ENTRIES = [
    {"entry": "I snapped at my roommate", "category": "communication", "date": "2026-03-01"},
    {"entry": "I yelled at my coworker", "category": "communication", "date": "2026-03-03"},
    {"entry": "I sent an angry text to my friend", "category": "impulse", "date": "2026-03-05"},
    {"entry": "I was passive aggressive to my sister", "category": "tone", "date": "2026-03-02"},
    {"entry": "I gave a rude response to my friend", "category": "tone", "date": "2026-03-04"},
    {"entry": "I sent a message without thinking", "category": "impulse", "date": "2026-03-06"},
    {"entry": "I didn't speak up when I should have", "category": "silence", "date": "2026-03-03"},
    {"entry": "I lost my temper during an argument", "category": "communication", "date": "2026-03-07"},
]

def get_insights(user_id: str):
    """
    Computes insights from past entries.
    Returns category breakdown, entry frequency, and trend line.
    """

    # 1. Category breakdown
    categories = [x["category"] for x in SAMPLE_ENTRIES]
    category_counts = Counter(categories)
    total = len(SAMPLE_ENTRIES)
    category_breakdown = {
        cat: {"count": count, "percentage": round((count / total) * 100, 1)}
        for cat, count in category_counts.items()
    }

    # 2. Trigger frequency (most common words in entries)
    all_words = []
    for x in SAMPLE_ENTRIES:
        words = x["entry"].lower().split()
        all_words.extend(words)
    # Filter out common words that aren't useful
    stop_words = {"i", "at", "my", "a", "the", "an", "to", "on", "up", "way"}
    filtered_words = [x for x in all_words if x not in stop_words]
    trigger_frequency = dict(Counter(filtered_words).most_common(5))

    # 3. Trend line (entries per date)
    dates = [x["date"] for x in SAMPLE_ENTRIES]
    trend_line = dict(sorted(Counter(dates).items()))

    return {
        "user_id": user_id,
        "total_entries": total,
        "category_breakdown": category_breakdown,
        "trigger_frequency": trigger_frequency,
        "trend_line": trend_line
    }