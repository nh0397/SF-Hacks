import fitz  # PyMuPDF
import textract
import os
import re
from loguru import logger

class TextExtractor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.text_by_page = {}

    def extract_text(self):
        if self.file_path.endswith(".pdf"):
            return self._extract_from_pdf()
        elif self.file_path.endswith(".docx"):
            return self._extract_from_docx_with_textract()
        else:
            logger.error("Unsupported file format. Only .pdf and .docx are supported.")
            return {}

    def _extract_from_pdf(self):
        doc = fitz.open(self.file_path)
        extracted_text = {}

        for page_num, page in enumerate(doc, start=1):
            raw_text = page.get_text("text")
            cleaned_text = self._clean_text(raw_text)
            if cleaned_text and len(cleaned_text) > 20:
                extracted_text[page_num] = cleaned_text

        return extracted_text

    def _extract_from_docx_with_textract(self):
        try:
            raw_text = textract.process(self.file_path).decode('utf-8')
            cleaned_text = self._clean_text(raw_text)
            return {1: cleaned_text}  # All text treated as page 1
        except Exception as e:
            logger.error(f"Textract failed to extract text from DOCX: {e}")
            return {}

    def _clean_text(self, text):
        text = re.sub(r'\s+', ' ', text)  # Collapse multiple spaces
        text = re.sub(r'(\n\s*)+', '\n', text)  # Normalize newlines
        return text.strip()
    
# if __name__ == "__main__":
#     # Example usage
#     file_path = "/Users/jaylodha/Downloads/JANE_DOE_resume.docx"  # Change this to your file path
#     extractor = TextExtractor(file_path)
#     extracted_text = extractor.extract_text()
    
#     for page_num, text in extracted_text.items():
#         print(f"Page {page_num}: {text}")  # Print first 100 characters of each page