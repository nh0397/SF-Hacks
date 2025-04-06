import json
from extract_entities import batch_process
from post_process import LLMResponseProcessor
from loguru import logger

def run_sensitive_data_pipeline(input_text: str, batch_size: int = 1000) -> dict:
    """
    Runs the complete pipeline for sensitive data detection and masking.
    
    Args:
        input_text (str): The text to analyze and mask
        batch_size (int): Size of text batches for processing
        
    Returns:
        dict: Results containing original text, detected entities, masked text, and masked entities
    """
    # Load sensitive data definitions
    with open("backend/Ollama/sensitive_directory.json", "r") as f:
        sensitive_definitions = json.load(f)
    
    # Step 1: Extract sensitive entities
    logger.info("Step 1: Extracting sensitive entities...")
    try:
        extracted_entities = batch_process(input_text, sensitive_definitions, batch_size)
        logger.success(f"Successfully extracted {sum(len(entities) for entities in extracted_entities.values())} entities")
    except Exception as e:
        logger.error(f"Error in entity extraction: {e}")
        return {
            "error": "Entity extraction failed",
            "details": str(e)
        }
    
    # Step 2: Process and mask the text
    logger.info("Step 2: Processing and masking text...")
    try:
        processor = LLMResponseProcessor()
        masked_text, masked_entities = processor.postprocess_response(input_text, entities=extracted_entities)
        logger.success("Successfully masked sensitive data")
    except Exception as e:
        logger.error(f"Error in text processing/masking: {e}")
        return {
            "error": "Text processing/masking failed",
            "details": str(e)
        }
    
    # Step 3: Prepare final results
    logger.info("Step 3: Preparing final results...")
    result = {
        "original_text": input_text,
        "detected_entities": extracted_entities,
        "masked_text": masked_text,
        "masked_entities": masked_entities,
        "entity_counts": {
            entity_type: len(entities) 
            for entity_type, entities in extracted_entities.items()
        }
    }
    
    return result

def pretty_print_results(results: dict) -> None:
    """
    Prints the pipeline results in a readable format.
    
    Args:
        results (dict): The results from run_sensitive_data_pipeline
    """
    if "error" in results:
        print("\n❌ Pipeline Error:")
        print(f"Error: {results['error']}")
        print(f"Details: {results['details']}")
        return
    
    print("\n📊 Pipeline Results:")
    
    # Print entity counts
    print("\n🔍 Detected Entities:")
    for entity_type, count in results['entity_counts'].items():
        if count > 0:
            print(f"  - {entity_type}: {count} entities")
    
    # Print original text
    print("\n📝 Original Text:")
    print(results['original_text'])
    
    # Print masked text
    print("\n🎭 Masked Text:")
    print(results['masked_text'])
    
    # Print masked entities dictionary
    print("\n📋 Masked Entities Dictionary:")
    for entity_type, entities in results['masked_entities'].items():
        print(f"\n{entity_type}:")
        for entity in entities:
            print(f"  Original: {entity['original']}")
            print(f"  Masked:   {entity['masked']}")

if __name__ == "__main__":
    # Example usage
    sample_text = """
    Earlier this year, Jane S. relocated to 123 Elm Street, Springfield, IL 62704. 
    Her cousin, Mark W., still lives at their old house—77 Waverly Blvd, Chicago, IL 60616. 
    While updating her records, she mentioned she was born on 12/24/1988, and just to be safe, 
    she recited her 9-digit number: 321-54-9876. She emailed a scanned utility bill from 
    jane.smith92@gmail.com, which matched the billing address on her profile. Interestingly, 
    the form also listed her backup email: jsmith_alt@protonmail.com.
    
    When asked for a payment method, she referred to her card: 4539 1488 0343 6467, and 
    mentioned the zip tied to it was 62704. Later she used a work phone number—(415) 333-9988—because 
    her personal line (312-555-7890) was unreachable due to SIM issues.
    """
    
    # Run the pipeline
    results = run_sensitive_data_pipeline(sample_text)
    
    # Print results
    pretty_print_results(results) 