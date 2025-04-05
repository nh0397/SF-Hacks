import requests

def run_ner_with_ollama(text):
    prompt = f"""
You are a Named Entity Recognition (NER) system.
Extract named entities from the following sentence and categorize them into Person, Organization, Location, and Date:

"{text}"

Return the output in JSON format like this:
{{
  "Person": [],
  "Organization": [],
  "Location": [],
  "Date": []
}}
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }
    )

    if response.status_code == 200:
        print("NER Output:\n", response.json()["response"])
    else:
        print("Error:", response.status_code, response.text)

if __name__ == "__main__":
    # Example sentence
    sentence = "Barack Obama was born in Hawaii and served as President of the United States."
    run_ner_with_ollama(sentence)