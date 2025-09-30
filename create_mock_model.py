import pickle
import os

# A simple placeholder function for summarization
def mock_summarize(text):
    """
    This is a mock summarizer function.
    It takes a string of text and returns the first two sentences.
    """
    sentences = text.split('.')
    summary = ". ".join(sentences[:2]).strip()
    if summary:
        return summary + "."
    return "Could not generate a summary from the provided text."

# Ensure the model directory exists
if not os.path.exists('model'):
    os.makedirs('model')

# Save the mock function into a pickle file
with open('model/summarizer.pkl', 'wb') as file:
    pickle.dump(mock_summarize, file)

print("Mock 'summarizer.pkl' created successfully in the 'backend/model/' directory.")
