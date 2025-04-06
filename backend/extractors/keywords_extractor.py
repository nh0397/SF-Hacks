import re
from typing import Dict, List


class SensitiveKeywordMasker:
    def __init__(self, user_input: str, sensitive_data_params: List[Dict]):
        """
        Initialize the keyword masking class.
        
        :param user_input: The text to be processed.
        :param sensitive_data_params: List of dictionaries containing detector names and corresponding keywords.
        """
        self.user_input = user_input
        self.sensitive_data_params = sensitive_data_params
        self.masked_input = user_input
        self.is_sensitive = False
        self.entity_counts = {}
        self.entity_mappings = {}
        self.processed_keywords = {}  # Track processed values and their placeholders

    def _find_sensitive_keywords(self, keywords: List[str], input_text: str) -> List[str]:
        """
        Find sensitive keywords present in the input text.

        :param keywords: List of keywords to look for.
        :param input_text: The text to be searched.
        :return: List of matched keywords.
        """
        found_keywords = []
        for keyword in keywords:
            pattern = rf"\b{re.escape(keyword)}\b"  # Ensure exact match with word boundaries
            if re.search(pattern, input_text, re.IGNORECASE):
                found_keywords.append(keyword)
        return found_keywords

    def _replace_sensitive_keyword(self, keyword: str, entity_name: str, current_count: int) -> str:
        """
        Replace sensitive keyword with a placeholder.

        :param keyword: The detected sensitive keyword.
        :param entity_name: The detector name associated with the keyword.
        :param current_count: The counter for occurrences.
        :return: Placeholder value.
        """
        original_value = keyword.lower()

        # If already processed, reuse the same placeholder
        if original_value in self.processed_keywords:
            return self.processed_keywords[original_value]

        # Generate a new placeholder
        placeholder = f"{entity_name}_{current_count}"
        self.processed_keywords[original_value] = placeholder
        self.entity_mappings[placeholder] = keyword
        return placeholder

    def _process_keywords(self, entity_name: str, keywords: List[str]):
        """
        Process a set of keywords and mask them in the text.

        :param entity_name: The detector name.
        :param keywords: List of keywords associated with this entity.
        """
        count = 0
        found_keywords = self._find_sensitive_keywords(keywords, self.masked_input)

        for keyword in found_keywords:
            # If already processed, skip
            if keyword.lower() in self.processed_keywords:
                continue

            # Increment count and replace with placeholder
            count += 1
            placeholder = self._replace_sensitive_keyword(keyword, entity_name, count)

            # Replace occurrences with placeholder
            self.masked_input = re.sub(
                rf"\b{re.escape(keyword)}\b", placeholder, self.masked_input, flags=re.IGNORECASE
            )
            self.is_sensitive = True

        if count > 0:
            self.entity_counts[entity_name] = count

    def mask_sensitive_keywords(self) -> Dict:
        """
        Mask sensitive keywords in the input text.

        :return: Dictionary containing original input, masked input, entity mappings, and flags.
        """
        for entity in self.sensitive_data_params:
            entity_name = entity["detector_name"]
            keywords = entity.get("keywords", [])
            self._process_keywords(entity_name, keywords)

        return {
            "original_input": self.user_input,
            "masked_input": self.masked_input,
            "is_sensitive": self.is_sensitive,
            "masked_entities": self.entity_mappings,
            "entities_found": list(self.entity_counts.keys()),  # List of found entity types
        }