import re
from typing import List, Dict


class SensitiveDataMasker:
    def __init__(self, user_input: str, sensitive_data_params: List[Dict[str, List[str]]]):
        """
        Initializes the sensitive data masker.

        :param user_input: The text input that may contain sensitive data.
        :param sensitive_data_params: A list of dictionaries, each containing:
                                      - "detector_name": The name of the sensitive data type (e.g., "EMAIL_ADDRESS").
                                      - "regex_patterns": A list of regex patterns for detecting that data type.
        """
        self.user_input = user_input
        self.sensitive_data_params = sensitive_data_params
        self.masked_input = user_input
        self.is_sensitive = False
        self.entity_counts = {}
        self.entity_mappings = {}
        self.processed_values = {}  # Track already processed values and their placeholders
        self.entities_found = set()  # Store unique sensitive entity names

    def _find_sensitive_matches(self, pattern: str, input_text: str) -> List[re.Match]:
        """
        Find all matches of a regex pattern in the given input text.
        """
        return list(re.finditer(pattern, input_text, re.IGNORECASE))

    def _replace_sensitive_data(self, match: re.Match, entity_name: str, current_count: int) -> str:
        """
        Replace a sensitive match with a placeholder and update mappings.
        """
        original_value = match.group(0)

        # If this value was already processed, reuse the same placeholder
        if original_value.lower() in self.processed_values:
            return self.processed_values[original_value.lower()]

        # Generate a new placeholder and save the mapping
        placeholder = f"{entity_name}_{current_count}"
        self.processed_values[original_value.lower()] = placeholder
        self.entity_mappings[placeholder] = original_value
        return placeholder

    def _process_entity(self, detector_name: str, patterns: List[str]):
        """
        Process a single entity, replacing matches with placeholders.
        """
        count = 0
        for pattern in patterns:
            matches = self._find_sensitive_matches(pattern, self.masked_input)
            for match in matches:
                # Skip already processed values
                if match.group(0).lower() in self.processed_values:
                    continue

                # Increment count and replace the match with a placeholder
                count += 1
                placeholder = self._replace_sensitive_data(match, detector_name, count)

                # Replace all occurrences of the match with the placeholder
                self.masked_input = re.sub(
                    re.escape(match.group(0)), placeholder, self.masked_input, flags=re.IGNORECASE
                )
                self.is_sensitive = True

        if count > 0:
            self.entity_counts[detector_name] = count
            self.entities_found.add(detector_name)  # Add entity name to the set

    def mask_sensitive_data(self) -> Dict:
        """
        Identify sensitive data in the input and perform masking.
        """
        for entity in self.sensitive_data_params:
            detector_name = entity["detector_name"]
            regex_patterns = entity["regex_patterns"]
            self._process_entity(detector_name, regex_patterns)

        return {
            "original_input": self.user_input,
            "masked_input": self.masked_input,
            "is_sensitive": self.is_sensitive,
            "masked_entities": self.entity_mappings,
            "entities_found": list(self.entities_found)  # Convert set to list
        }
