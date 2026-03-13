import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.patterns import detect_pattern

past_entries = [
    "I snapped at my roommate",
    "I yelled at my coworker",
    "I sent an angry text to my friend",
    "I ate junk food again",
    "I stayed up way too late"
]

result = detect_pattern("I lost my temper at my sister", past_entries)

print(f"Pattern detected: {result['pattern_detected']}")
print(f"Similar entries found: {result['similar_count']}")
for e in result['similar_entries']:
    print(f"  - {e['entry']} (score: {e['similarity_score']})")
