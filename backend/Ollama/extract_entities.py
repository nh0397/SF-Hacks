import requests
import json
import time
import re

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
    - Accurately identify and extract sensitive entities based on provided definitions.
    - Precisely report each entity's exact text and its character-level position (start and end indices).
    - Strictly output in JSON format.

    ---

    ### Extraction Rules:
    1. EMAIL:
       - Must contain @ symbol
       - Must have valid domain
       - Example: user@domain.com

    2. SSN:
       - Must be 9 digits
       - May have dashes or spaces
       - Example: 123-45-6789 or 123 45 6789

    3. PHONE:
       - Must be 10 digits
       - May have parentheses, dashes, or spaces
       - Example: (123) 456-7890 or 123-456-7890

    4. CREDIT_CARD:
       - Must be 16 digits
       - May have spaces or dashes
       - Example: 1234 5678 9012 3456

    5. ADDRESS:
       - Must contain street number and name
       - May include city, state, zip
       - Example: 123 Main St, Springfield, IL 62704

    6. DOB:
       - Must be a valid date
       - Various formats: MM/DD/YYYY, YYYY-MM-DD, etc.
       - Example: 12/24/1988 or 1988-12-24

    ---

    ### Validation Rules:
    - Extract ONLY complete, valid entities
    - Do NOT extract partial matches
    - Do NOT extract ambiguous references
    - Verify each entity matches its type's format
    - If unsure, DO NOT extract

    ---

    ### Required JSON Output Format:
    ```json
    {
      "ENTITY_TYPE": [
        {"entity": "exact extracted text"}
      ]
    }
    ```
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
        "model": "deepseek-r1:latest",
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ],
        "stream": False
    }

    attempt = 0
    while attempt < max_retries:
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            response_json = response.json()

            if "message" not in response_json or "content" not in response_json["message"]:
                raise ValueError("Invalid response structure: 'message.content' missing")

            content = response_json["message"]["content"]
            
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                start = content.find("{")
                end = content.rfind("}")
                if start != -1 and end != -1:
                    result = json.loads(content[start:end+1])
                else:
                    raise ValueError("Response content is not valid JSON")

            # Validate the extracted entities
            validated_result = {}
            for entity_type, entities in result.items():
                validated_entities = []
                for entity in entities:
                    if isinstance(entity, dict) and 'entity' in entity:
                        # Validate entity format
                        if validate_entity_format(entity['entity'], entity_type):
                            validated_entities.append(entity['entity'])
                if validated_entities:
                    validated_result[entity_type] = validated_entities
            return validated_result

        except (requests.RequestException, ValueError, json.JSONDecodeError) as e:
            attempt += 1
            if attempt >= max_retries:
                raise Exception(f"Failed after {max_retries} attempts: {str(e)}")
            wait_time = backoff_factor ** attempt
            print(f"Attempt {attempt} failed, retrying in {wait_time}s...")
            time.sleep(wait_time)
    raise Exception("Unexpected error in extract_sensitive_entities")

def validate_entity_format(entity: str, entity_type: str) -> bool:
    """
    Validates if an entity matches its expected format.
    
    Args:
        entity (str): The entity text to validate
        entity_type (str): The type of entity
        
    Returns:
        bool: True if the entity matches its expected format
    """
    if entity_type == 'EMAIL':
        return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', entity))
    elif entity_type == 'SSN':
        return bool(re.match(r'^\d{3}[-\s]?\d{2}[-\s]?\d{4}$', entity))
    elif entity_type == 'PHONE':
        return bool(re.match(r'^\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$', entity))
    elif entity_type == 'CREDIT_CARD':
        digits = re.sub(r'[^\d]', '', entity)
        return len(digits) == 16
    elif entity_type == 'ADDRESS':
        # Basic address validation - must contain number and street name
        return bool(re.match(r'^\d+\s+[a-zA-Z\s]+', entity))
    elif entity_type == 'DOB':
        # Various date formats
        return bool(re.match(r'^\d{1,2}/\d{1,2}/\d{4}$|^\d{4}-\d{2}-\d{2}$', entity))
    return False

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

        # No need to adjust indices anymore since we're not tracking positions
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