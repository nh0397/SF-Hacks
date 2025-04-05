import requests
import json
import time

def extract_sensitive_entities(user_input, sensitive_data_json, max_retries=3, backoff_factor=1):
    system_prompt = """
You are a data privacy assistant tasked with identifying sensitive information and their positions in text. Sensitive data types and their definitions are provided.

Responsibilities:
1. Understand definitions in `sensitive_data_json`.
2. Detect occurrences of these sensitive types in the `user_input` text.
3. For each entity detected, return the exact substring and its starting and ending positions in the original text.

Strict JSON output format required:
{
  "EMAIL": [{"entity": "email@example.com", "start": 10, "end": 27}],
  "SSN": [{"entity": "123-45-6789", "start": 100, "end": 111}],
  ...
}

Rules:
- List only defined data types.
- Use empty lists if no data found.
- Provide valid JSON output without extra explanations.
"""
    user_prompt = f"""
User input:
"{user_input}"

Sensitive data definitions:
{sensitive_data_json}

Respond strictly in the specified JSON format with entity positions.
"""
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ],
        "stream": False
    }
    attempt = 0
    while attempt < max_retries:
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()  # Raise for HTTP errors
            response_json = response.json()
            if "message" not in response_json or "content" not in response_json["message"]:
                raise ValueError("Response JSON missing required 'message.content' key")
            content = response_json["message"]["content"]
            result = json.loads(content)
            return result
        except (requests.exceptions.RequestException, ValueError, json.JSONDecodeError) as e:
            attempt += 1
            if attempt >= max_retries:
                raise Exception(f"Failed after {max_retries} attempts. Error: {str(e)}")
            time.sleep(backoff_factor * attempt)
    raise Exception("Unexpected error in extract_sensitive_entities")

def batch_process(text, sensitive_data_json, batch_size=1000):
    results = []
    for i in range(0, len(text), batch_size):
        batch_text = text[i:i+batch_size]
        try:
            batch_entities = extract_sensitive_entities(batch_text, sensitive_data_json)
        except Exception as e:
            print(f"Error processing batch starting at index {i}: {e}")
            batch_entities = {key: [] for key in sensitive_data_json.keys()}
        # Adjust positions so they reflect the indices in the full text
        for entity_type, entities in batch_entities.items():
            validated_entities = []
            for entity in entities:
                if isinstance(entity, dict) and 'start' in entity and 'end' in entity:
                    entity["start"] += i
                    entity["end"] += i
                    validated_entities.append(entity)
            batch_entities[entity_type] = validated_entities
        results.append(batch_entities)
    # Merge results from all batches into one dictionary
    merged_results = {key: [] for key in sensitive_data_json.keys()}
    for batch_entities in results:
        for entity_type, entities in batch_entities.items():
            merged_results[entity_type].extend(entities)
    return merged_results