import json
import re
from loguru import logger



class LLMResponseProcessor:
    """
    Handles all transformations needed to convert raw LLM outputs into valid JSON,
    including fixing quote issues, extracting JSON from text, etc.
    """

    @staticmethod
    def replace_quotes(string: str) -> str:
        """
        Replaces single quotes in a string with double quotes to ensure valid JSON format.
        """
        # Handle list boundaries
        string = re.sub(r"\[([^\]]*)\]", lambda m: "[" + m.group(1).replace("'", "\"") + "]", string)

        # Structural replacements
        string = re.sub(r"\'\s*}", '"}', string)  
        string = re.sub(r"{\s*\'", '{"', string)  
        string = re.sub(r"\'\s*:", '":', string)  
        string = re.sub(r":\s*\'", ':"', string)  
        string = re.sub(r"\'\s*,", '",', string)  
        string = re.sub(r",\s*\'", ',"', string)

        return string

    @staticmethod
    def extract_json_string(response: str) -> str:
        """
        Extracts the JSON object from the response, ensuring balanced braces if needed.
        """
        try:
            # Check if it's already valid JSON
            json.loads(response)
            return response
        except json.JSONDecodeError:
            # Attempt to find JSON boundaries
            start = response.find("{")
            end = response.rfind("}") + 1
            if start == -1 or end == 0:
                logger.error("No JSON object found in response.")
                return "{}"

            json_str = response[start:end]
            # Fix unbalanced braces if needed
            opening_braces = json_str.count('{')
            closing_braces = json_str.count('}')
            if opening_braces > closing_braces:
                json_str = json_str + ('}' * (opening_braces - closing_braces))
            return json_str

    @staticmethod
    def restore_inner_apostrophes(text: str) -> str:
        """
        Convert double quotes appearing *within* a word (e.g. don"t) back to single quotes.
        For example: 'don"t' -> 'don't'.
        """
        # Regex looks for sequences: letter/digit -> " -> letter/digit
        # then replaces that middle " with an '
        return re.sub(r'([A-Za-z0-9])"([A-Za-z0-9])', r"\1'\2", text)

    def postprocess_response(self, response: str) -> str:
        """
        Ensures the final string is valid JSON, or at least returns an empty JSON if not possible.
        """
        # 1. First try to parse as valid JSON
        try:
            json.loads(response)
            return response
        except json.JSONDecodeError:
            pass

        # 2. Replace quotes and try extracting again
        replaced_str = LLMResponseProcessor.replace_quotes(response)
        extracted_str = LLMResponseProcessor.extract_json_string(replaced_str)
        extracted_str = LLMResponseProcessor.restore_inner_apostrophes(extracted_str)

        # 3. Final check
        try:
            json.loads(extracted_str)
            return extracted_str
        except json.JSONDecodeError as e:
            logger.error(f"Failed to create valid JSON after processing: {e}")
            logger.debug(f"Problematic string: {extracted_str}")
            return "{}"