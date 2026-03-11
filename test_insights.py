from app.insights import get_insights

result = get_insights("123")

print(f"Total entries: {result['total_entries']}")
print(f"\nCategory breakdown: {result['category_breakdown']}")
print(f"\nTop triggers: {result['trigger_frequency']}")
print(f"\nTrend line: {result['trend_line']}")