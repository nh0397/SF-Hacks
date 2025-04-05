import requests
import json

def extract_sensitive_entities(user_input, sensitive_data_json):
    system_prompt = """
You are a data privacy assistant tasked with identifying sensitive information in text. Sensitive data is defined by a dictionary called `sensitive_data_json`, where each key represents a type of sensitive information and each value contains a description of that type.

Your responsibilities:
1. Parse `sensitive_data_json` to understand what qualifies as sensitive data.
2. Detect occurrences of these types in the `user_input` text.
3. For each key (data type), list **all exact substrings** from the input text that match the definition of that data type.

Your output must strictly follow this format:
{
  "EMAIL": [...],
  "SSN": [...],
  ...
}

Rules:
- Only list data types defined in the dictionary.
- If no data is found for a type, return an empty list for that type.
- Do not explain or add any extra text. Just return the JSON object as described.
"""

    user_prompt = f"""
Here is the user input:
\"{user_input}\"

This is the sensitive data definition:
\"{json.dumps(sensitive_data_json)}\"

Please return a JSON object with the format:
{{
  "DATA_TYPE": ["list of matching entities"]
}}

**Important Notes**:
- Only extract entities that are clearly defined in `sensitive_data_json`.
- Do not invent or assume any extra types.
- Output must be valid JSON. Do not include explanations.
"""

    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "mistral",
            "messages": [
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_prompt.strip()}
            ],
            "stream": False
        }
    )

    if response.status_code == 200:
        result = response.json()["message"]["content"]
        print("Detected Sensitive Entities:\n", result)
    else:
        print("Error:", response.status_code, response.text)


# Example run with extended corpus
if __name__ == "__main__":
    user_input = """
Jane Smith lives at 123 Elm Street, Springfield, IL 62704. Her email is jane.smith92@gmail.com and her phone number is (312) 555-7890.
She was born on 12/24/1988 and often uses her SSN 321-54-9876 for verification.
Her credit card number is 4539 1488 0343 6467 and billing address is the same.
She has another contact email at work: jane.s@company.org and a backup number 312-666-0001.
Date of birth is sometimes listed as 1988-12-24 in official documents.
"""

    sensitive_data_json = {
        "EMAIL": "Any string that represents an email address",
        "SSN": "A US social security number in the format XXX-XX-XXXX",
        "PHONE": "US phone number in formats like (XXX) XXX-XXXX or XXX-XXX-XXXX",
        "CREDIT_CARD": "Any 16-digit number formatted like a credit card",
        "ADDRESS": "Home or office address containing street names, numbers, zip code, or city",
        "DOB": "Date of birth in formats like MM/DD/YYYY or YYYY-MM-DD"
    }

    extract_sensitive_entities(user_input, sensitive_data_json)