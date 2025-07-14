#!/usr/bin/env python3
"""
Test script to verify fallback regex detection
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.masking import fallback_regex_detection

def test_fallback_detection():
    """Test the fallback regex detection with various sensitive data"""
    
    test_cases = [
        {
            "message": "My email is test@example.com and phone is (123) 456-7890",
            "expected_entities": ["EMAIL", "PHONE"]
        },
        {
            "message": "SSN: 123-45-6789, Credit card: 4539 1488 0343 6467",
            "expected_entities": ["SSN", "CREDIT_CARD"]
        },
        {
            "message": "No sensitive data here, just regular text.",
            "expected_entities": []
        },
        {
            "message": "Contact me at john.doe@company.com or call 555-123-4567",
            "expected_entities": ["EMAIL", "PHONE"]
        }
    ]
    
    print("🧪 Testing fallback regex detection...\n")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['message']}")
        
        result = fallback_regex_detection(test_case['message'])
        detected_entities = list(result['detected_entities'].keys())
        
        print(f"   Detected: {detected_entities}")
        print(f"   Expected: {test_case['expected_entities']}")
        print(f"   Masked: {result['masked_message']}")
        
        # Check if all expected entities were detected
        missing = set(test_case['expected_entities']) - set(detected_entities)
        extra = set(detected_entities) - set(test_case['expected_entities'])
        
        if not missing and not extra:
            print("   ✅ PASS")
        else:
            if missing:
                print(f"   ❌ MISSING: {missing}")
            if extra:
                print(f"   ❌ EXTRA: {extra}")
        
        print()

if __name__ == "__main__":
    test_fallback_detection() 