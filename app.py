from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import re
import nltk

# --- NLTK Setup ---
# This ensures the necessary 'punkt' tokenizer data is downloaded once.
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("NLTK 'punkt' resource not found. Downloading...")
    nltk.download('punkt')
    print("✅ 'punkt' downloaded successfully.")

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# --- Global variables for the model and tokenizer ---
# They are initialized to None. We will load them on the first request.
model = None
tokenizer = None
model_loaded = False

def preprocess_text(text):
    """
    Cleans and prepares text. This must be identical to the function
    used in your training notebook.
    """
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def load_summarizer():
    """
    Loads the portable, fine-tuned summarizer model directly from the
    Hugging Face Hub. This is the modern, reliable way to load models.
    This function will now be called only once, on the first API request.
    """
    global model, tokenizer, model_loaded
    
    # This points to the new, portable model repository you created.
    portable_model_repo_id = "TheOCEAN/summarizer-portable"
    
    print(f"--- 🔍 First request received. Loading portable model from Hugging Face Hub: '{portable_model_repo_id}' ---")
    
    try:
        # This one command downloads and correctly loads everything.
        tokenizer = PegasusTokenizer.from_pretrained(portable_model_repo_id)
        model = PegasusForConditionalGeneration.from_pretrained(portable_model_repo_id)

        # Set the model to evaluation mode for inference
        device = torch.device("cpu") # Ensure model runs on CPU
        model.to(device)
        model.eval()
            
        print("✅ Portable model and tokenizer loaded successfully.")
        model_loaded = True

    except Exception as e:
        print(f"❌ FATAL ERROR: Could not load the model from the Hub. Error: {e}")
        print(f"Please ensure the repository '{portable_model_repo_id}' exists and is public.")
        model = None
        model_loaded = False

@app.route('/summarize', methods=['POST'])
def summarize_endpoint():
    """API endpoint to handle summarization requests."""
    global model, tokenizer, model_loaded

    # --- LAZY LOADING LOGIC ---
    # If the model isn't loaded yet, load it now.
    if not model_loaded:
        load_summarizer()

    if model is None or tokenizer is None:
        return jsonify({
            "error": "The summarization model could not be loaded. Please check the backend server logs for errors."
        }), 503 # Service Unavailable

    try:
        data = request.get_json()
        text_to_summarize = data.get('text')

        if not text_to_summarize:
            return jsonify({"error": "No text provided"}), 400

        print(f"Received request to summarize text of length {len(text_to_summarize)}...")

        # Preprocess the text before tokenizing
        processed_text = preprocess_text(text_to_summarize)

        # Tokenize the input for the model
        inputs = tokenizer(processed_text, max_length=1024, return_tensors="pt", truncation=True)

        # Generate the summary
        with torch.no_grad(): # Disable gradient calculation for faster inference
            summary_ids = model.generate(
                inputs.input_ids, 
                num_beams=4, 
                max_length=150, 
                early_stopping=True
            )
        
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        print("✅ Summary generated successfully.")
        return jsonify({"summary": summary})

    except Exception as e:
        print(f"❌ An error occurred during summarization: {e}")
        return jsonify({"error": "An internal error occurred on the server."}), 500

if __name__ == '__main__':
    # We no longer load the model on startup.
    # The server starts instantly.
    app.run(host='0.0.0.0', port=5000, debug=True)

