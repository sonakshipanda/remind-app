from app.embeddings import get_embedding

result = get_embedding("I love food")
print(f"Number of values: {len(result)}")
print(f"First 5 values: {result[:5]}")