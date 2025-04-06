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

def get_sensitive_entities(input_text, user_sensitive_definitions, sensitive_directory_path="backend/Ollama/sensitive_directory.json"):
    """
    Extracts sensitive entities from input text using both user-defined and directory definitions.
    
    Args:
        input_text (str): The text to analyze for sensitive entities
        user_sensitive_definitions (dict): Dictionary of user-defined sensitive entity types and their patterns
        sensitive_directory_path (str): Path to the JSON file containing comprehensive sensitive definitions
    
    Returns:
        dict: Dictionary containing extracted entities from both user definitions and directory
    """
    # Load comprehensive sensitive directory from JSON file
    with open(sensitive_directory_path, "r") as f:
        sensitive_directory = json.load(f)
    
    # First extraction: using user-specified definitions
    entities_user = batch_process(input_text, user_sensitive_definitions, batch_size=1000)
    
    # Second extraction: using comprehensive sensitive directory definitions
    # entities_directory = batch_process(input_text, sensitive_directory, batch_size=1000)
    
    # Compare: Identify additional entities from the directory that are missing from the user extraction
    # additional_entities = compare_entities(entities_user, entities_directory)
    
    return {
        "User_Sensitive_Entities": entities_user
        # "Additional_Sensitive_Entities": additional_entities
    }

if __name__ == "__main__":
    # Example usage
    input_text = "Sample text to analyze"
    user_definitions = {
        "EMAIL": "Any string that represents an email address",
        "SSN": "A US social security number in the format XXX-XX-XXXX"
    }
    
    results = get_sensitive_entities(input_text, user_definitions)
    print(json.dumps(results, indent=2))