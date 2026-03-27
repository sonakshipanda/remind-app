from sentence_transformers import SentenceTransformer

# Load the pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str):
    
    """
    Convert a text entry into a list of numbers (embedding)
    Example input: "I snapped at my roommate"
    Example output: [0.23, 0.81, 0.45, ...] (384 numbers)
    """

    # Convert text to embedding
    embedding = model.encode(text)
    return embedding.tolist()
