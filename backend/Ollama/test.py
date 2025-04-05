from ollama_test import extract_sensitive_entities

if __name__ == "__main__":
    user_input = """
    Jane Smith lives at 123 Elm Street, Springfield, IL 62704. ohine.smith92@gmail.com and her phone number is (312) 555-7890.
    She was born on 12/24/1988 and often uses her SSN 321-54-9876 for verification.
    Her credit card number is 4539 1488 0343 6467 and billing address is the same.
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
