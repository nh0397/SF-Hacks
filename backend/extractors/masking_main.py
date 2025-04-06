from typing import List, Dict
from loguru import logger
from Ollama.get_sensitive_entities import get_sensitive_entities
from extractors.regex_extractor import SensitiveDataMasker
from extractors.keywords_extractor import SensitiveKeywordMasker
import re
import json
from copy import deepcopy

class Masking:

    def __init__(self):
        pass

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
        replaced_str = Masking.replace_quotes(response)
        extracted_str = Masking.extract_json_string(replaced_str)
        extracted_str = Masking.restore_inner_apostrophes(extracted_str)

        # 3. Final check
        try:
            json.loads(extracted_str)
            return extracted_str
        except json.JSONDecodeError as e:
            logger.error(f"Failed to create valid JSON after processing: {e}")
            logger.debug(f"Problematic string: {extracted_str}")
            return "{}"

    def merge_sensitive_data_dicts(self, dicts: List[Dict]) -> Dict:
        """
        Merges multiple sensitive data dictionaries based on masked_entities, 
        entities_found, and is_sensitive.
        
        :param dicts: List of dictionaries to merge.
        :return: Merged dictionary.
        """
        merged_dict = {
            "original_input": None,  # Keeping as None since original_input should not be modified
            "masked_input": None,  # Keeping as None since masked input will be different per dict
            "is_sensitive": False,
            "masked_entities": {},
            "entities_found": set()
        }

        for d in dicts:
            # If any dictionary has is_sensitive as True, set final value to True
            if d.get("is_sensitive", False):
                merged_dict["is_sensitive"] = True

            if not merged_dict.get("original_input"):
                merged_dict['original_input'] = d.get("original_input")

            if not merged_dict.get("masked_input"):
                merged_dict['masked_input'] = d.get("masked_input")

            # Merge masked_entities
            merged_dict["masked_entities"].update(d.get("masked_entities", {}))

            # Merge entities_found (ensure unique values using a set)
            merged_dict["entities_found"].update(d.get("entities_found", []))

        # Convert entities_found set back to a list
        merged_dict["entities_found"] = list(merged_dict["entities_found"])

        og_input = merged_dict['original_input']
        for entity_type, entity_name in merged_dict.get('masked_entities', {}).items():
            og_input = og_input.replace(entity_name, entity_type)

        merged_dict['masked_input'] = og_input

        return merged_dict
    
    def transform_to_numbered_format(self, merged_dict: dict) -> dict:
        """
        Converts the merged dictionary into a format where each entity is assigned 
        a numbered key, e.g. card_number_1, card_number_2, etc.
        """
        numbered_dict = {}
        for key, values in merged_dict.items():
            for i, value in enumerate(values, start=1):
                # ensure we only keep keys that match our output format
                # if key in self.output_format_keys:
                numbered_dict[f"{key}_{i}"] = value
        return numbered_dict

    def replace_entities_in_text(self, user_input: str, numbered_entities: dict) -> str:
        """
        Replaces detected entities in the user_input with their respective numbered keys.
        """
        out_text = deepcopy(user_input)
        for key, value in numbered_entities.items():
            out_text = out_text.replace(value, key)
        return out_text

    def mask(self, user_input: str, ml_detectors: List, regex_detectors: List, keyword_detectors: List):
        
        ml_out = {}
        regex_out = {}
        keywords_out = {}

        logger.debug(f"keyword detectors: {keyword_detectors}")
        logger.debug(f"regex detectors: {regex_detectors}")
        logger.debug(f"ml detectors: {ml_detectors}")
        
        if ml_detectors:
            f_ml_detectors = {det_data['detector_name']: det_data['description'] for det_data in ml_detectors}
            try:
                ml_out = get_sensitive_entities(user_input, f_ml_detectors)
                logger.debug(f"ml out: {ml_out}")

            except Exception as e:
                logger.error(f"Error in ML-based detection: {e}")
                ml_out = {
                    "original_input": user_input,
                    "masked_input": user_input,
                    "is_sensitive": False,
                    "masked_entities": {},
                    "entities_found": []
                }

            # Postprocess the ML output to ensure valid JSON   
            try:
                # ml_out = self.postprocess_response(ml_out)
                # if isinstance(ml_out, str):
                #     ml_out = json.loads(ml_out)

                numbered_entities = self.transform_to_numbered_format(ml_out.get("User_Sensitive_Entities", {}))

                if numbered_entities:
                    masked_text = self.replace_entities_in_text(user_input.lower(), numbered_entities)
                    return {
                        "original_input": user_input.lower(),
                        "masked_input": masked_text,
                        "masked_entities": numbered_entities,
                        "entities_found": list(ml_out.keys()),
                        "is_sensitive": True
                    }
                else:
                    return {
                        "original_input": user_input.lower(),
                        "masked_input": "",
                        "masked_entities": {},
                        "entities_found": [],
                        "is_sensitive": False
                    }

                
            except Exception as e:  
                logger.error(f"Error in postprocessing ML output: {e}")
                ml_out = {
                    "original_input": user_input,
                    "masked_input": user_input,
                    "is_sensitive": False,
                    "masked_entities": {},
                    "entities_found": []
                }

        if regex_detectors:
            masker = SensitiveDataMasker(user_input, regex_detectors)
            regex_out = masker.mask_sensitive_data()
            logger.debug(f"regex out: {regex_out}")

        if keyword_detectors:
            masker = SensitiveKeywordMasker(user_input, keyword_detectors)
            keywords_out = masker.mask_sensitive_keywords()
            logger.debug(f"keywords out: {keywords_out}")

        return self.merge_sensitive_data_dicts([ml_out, regex_out, keywords_out])
