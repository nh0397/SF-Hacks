import requests
import json
import time

def extract_sensitive_entities(user_input, sensitive_data_json, max_retries=3, backoff_factor=2):
    """
    Extracts sensitive entities from user input text using the specified API.

    Args:
        user_input (str): The text to analyze for sensitive information.
        sensitive_data_json (dict): JSON containing definitions of sensitive data types.
        max_retries (int): Maximum number of retry attempts for API calls.
        backoff_factor (int): Multiplier for exponential backoff between retries.

    Returns:
        dict: Dictionary containing detected entities with their positions in the text.
    
    Raises:
        Exception: If all retry attempts fail or if the response format is invalid.
    """
    system_prompt = """
    ### Task Definition
    You are an expert data-privacy assistant specializing in Named Entity Recognition (NER) for identifying sensitive entities within provided text.

    Your goal is to:
    - Accurately identify and extract sensitive entities based on provided definitions (`sensitive_data_json`).
    - Precisely report each entity’s exact text and its character-level position (start and end indices) in the original input text.
    - Strictly output in JSON format.

    ---

    ### Extraction Rules:
    - Extract ONLY clearly defined, explicitly sensitive entities.
    - Entities must be fully qualified and explicitly mentioned.
    - Do NOT extract vague, abbreviated, ambiguous, or context-dependent references ("same as above", "near cafe").
    - If unsure, DO NOT extract.

    ---

    ### Required JSON Output Format:
    ```json
    {
      "ENTITY_TYPE_1": [
        {"entity": "exact extracted text", "start": index, "end": index}
      ],
      "ENTITY_TYPE_2": [],
      "...": []
    }
    ```
    Strictly adhere to this JSON output format without additional explanations.
    """

    user_prompt = f"""
    User input:
    "{user_input}"

    Sensitive data definitions:
    {json.dumps(sensitive_data_json, indent=2)}
    
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
            response = requests.post(url, json=payload, timeout=30)  # Increased timeout
            response.raise_for_status()
            response_json = response.json()

            if "message" not in response_json or "content" not in response_json["message"]:
                raise ValueError("Invalid response structure: 'message.content' missing")

            content = response_json["message"]["content"]
            
            # Debug: Print the raw response content
            print("Response content:", content)

            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract a valid JSON substring if extra text is present
                start = content.find("{")
                end = content.rfind("}")
                if start != -1 and end != -1:
                    result = json.loads(content[start:end+1])
                else:
                    raise ValueError("Response content is not valid JSON")
            return result
        except (requests.RequestException, ValueError, json.JSONDecodeError) as e:
            attempt += 1
            if attempt >= max_retries:
                raise Exception(f"Failed after {max_retries} attempts: {str(e)}")
            wait_time = backoff_factor ** attempt
            print(f"Attempt {attempt} failed, retrying in {wait_time}s...")
            time.sleep(wait_time)
    raise Exception("Unexpected error in extract_sensitive_entities")


def batch_process(text, sensitive_data_json, batch_size=1000):
    """
    Processes large text input in batches to extract sensitive entities.

    Args:
        text (str): The complete text to analyze.
        sensitive_data_json (dict): JSON containing definitions of sensitive data types.
        batch_size (int): Size of each text batch to process.

    Returns:
        dict: Merged results from all batches containing detected entities with their positions.
    """
    results = []
    for i in range(0, len(text), batch_size):
        batch_text = text[i:i+batch_size]
        try:
            batch_entities = extract_sensitive_entities(batch_text, sensitive_data_json)
        except Exception as e:
            print(f"Error processing batch starting at index {i}: {e}")
            batch_entities = {key: [] for key in sensitive_data_json.keys()}

        # Adjust the entity indices relative to the full text
        for entity_type, entities in batch_entities.items():
            validated_entities = []
            for entity in entities:
                if isinstance(entity, dict) and 'start' in entity and 'end' in entity:
                    entity["start"] += i
                    entity["end"] += i
                    validated_entities.append(entity)
            batch_entities[entity_type] = validated_entities
        results.append(batch_entities)

    merged_results = {key: [] for key in sensitive_data_json.keys()}
    for batch_entities in results:
        for entity_type, entities in batch_entities.items():
            merged_results[entity_type].extend(entities)
    return merged_results


# Example usage:
if __name__ == "__main__":
    sensitive_definitions = {
        "EMAIL": "Email addresses",
        "SSN": "Social Security Numbers",
        "PHONE": "Phone numbers",
        "CREDIT_CARD": "Credit card numbers",
        "ADDRESS": "Physical street addresses",
        "DOB": "Dates of birth"
    }

    sample_text = "Your example text here with sensitive data."

    extracted_entities = batch_process(sample_text, sensitive_definitions, batch_size=500)
    print(json.dumps(extracted_entities, indent=2))