from extract_entities import batch_process
import json

def compare_entities(user_entities, directory_entities):
    """
    Compares two sets of extraction results.
    For each entity type in the directory, identifies any entity (based on its 'entity' text)
    that appears in the directory results but not in the user-defined results.
    """
    additional = {}
    for key, dir_entities in directory_entities.items():
        user_list = user_entities.get(key, [])
        user_entity_texts = set(e['entity'] for e in user_list)
        additional_list = []
        for entity in dir_entities:
            if entity['entity'] not in user_entity_texts:
                additional_list.append(entity)
        additional[key] = additional_list
    return additional

def pretty_print_entities(entities):
    """
    Prints the extracted entities in a more readable format.
    """
    print("\n=== Extracted Sensitive Entities ===\n")
    for entity_type, items in entities.items():
        if items:  # Only print if there are entities of this type
            print(f"\n{entity_type}:")
            for item in items:
                print(f"  - {item['entity']}")
                if 'confidence' in item:
                    print(f"    Confidence: {item['confidence']:.2f}")
    print("\n" + "="*30 + "\n")

if __name__ == "__main__":
    user_input = """
    Earlier this year, Jane S. relocated to 123 Elm Street, Springfield, IL 62704. Her cousin, Mark W., still lives at their old house—77 Waverly Blvd, Chicago, IL 60616. 
    While updating her records, she mentioned she was born on 12/24/1988, and just to be safe, she recited her 9-digit number: 321-54-9876. 
    Ironically, she also mentioned her library ID which is 123-45-6789, which sometimes gets confused with more sensitive numbers.

    During the call, the agent asked her to confirm the digits she'd used for government verification last year, and she repeated, "Yeah, that was the same number, 321549876, right?"
    She emailed a scanned utility bill from ohine.smith92@gmail.com, which matched the billing address on her profile. Interestingly, the form also listed her backup email: jsmith_alt@protonmail.com.

    When asked for a payment method, she referred to her card: 4539 1488 0343 6467, and mentioned the zip tied to it was 62704. 
    Later she used a work phone number—(415) 333-9988—because her personal line (312-555-7890) was unreachable due to SIM issues.

    Mark's contact was also attached in the document: m.wilson@ymail.com, along with his alternate number 773.444.1122. 
    Both addresses were marked under the "active contact file."

    Jane's DOB was written in one place as 1988-12-24 and another form had it as Dec 24, '88. 
    Her card billing address was mentioned simply as "same as home," but one of the forms had "123 Elm St." handwritten in.

    We noticed a number in the scanned form: 987654321, but it wasn't clear whether it was a routing number or just a form ID.

    Lastly, the reference form included some redacted digits: XXXX-XXXX-XXXX-6467.
    """
    
    # User-specified sensitive definitions
    user_sensitive_definitions = {
        "EMAIL": "Any string that represents an email address. Example: email@example.com",
        "SSN": "A US social security number in the format XXX-XX-XXXX. Example: 123-45-6789",
        "PHONE": "US phone number in formats like (XXX) XXX-XXXX or XXX-XXX-XXXX. Example: (312) 555-7890",
        "CREDIT_CARD": "Any 16-digit number formatted like a credit card. Example: 4539 1488 0343 6467",
        "ADDRESS": "Home or office address containing street names, numbers, zip code, or city. Example: 123 Elm St., Springfield, IL 62704",
        "DOB": "Date of birth in formats like MM/DD/YYYY or YYYY-MM-DD. Example: 12/24/1988 or 1988-12-24"
    }
    
    # Load comprehensive sensitive directory from JSON file
    with open("backend/Ollama/sensitive_directory.json", "r") as f:
        sensitive_directory = json.load(f)
    
    # First extraction: using user-specified definitions
    entities_user = batch_process(user_input, user_sensitive_definitions, batch_size=1000)
    
    # Second extraction: using comprehensive sensitive directory definitions
    # entities_directory = batch_process(user_input, sensitive_directory, batch_size=1000)
    
    # Compare: Identify additional entities from the directory that are missing from the user extraction
    # additional_entities = compare_entities(entities_user, entities_directory)
    
    final_result = {
        "User_Sensitive_Entities": entities_user
        # "Additional_Sensitive_Entities": additional_entities
    }
    
    # Print the results in a readable format
    pretty_print_entities(entities_user)
    
    # Keep the JSON structure for analysis
    print("JSON structure for analysis:")
    print(json.dumps(final_result, indent=2))