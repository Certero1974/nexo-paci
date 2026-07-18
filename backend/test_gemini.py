import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"Testing with key starting with: {api_key[:5] if api_key else 'None'}...")

genai.configure(api_key=api_key)

models_to_test = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.0-flash"]

for model_name in models_to_test:
    print(f"\n--- Testing model: {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hola, di la palabra EXITOSO en una sola palabra.")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error for {model_name}: {e}")
