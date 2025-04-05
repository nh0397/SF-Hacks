from extract_entities import extract_sensitive_entities

if __name__ == "__main__":

    user_input = """
    Earlier this year, Jane S. relocated to 123 Elm Street, Springfield, IL 62704. Her cousin, Mark W., still lives at their old house—77 Waverly Blvd, Chicago, IL 60616. 
    While updating her records, she mentioned she was born on 12/24/1988, and just to be safe, she recited her 9-digit number: 321-54-9876. 
    Ironically, she also mentioned her library ID which is 123-45-6789, which sometimes gets confused with more sensitive numbers.

    During the call, the agent asked her to confirm the digits she’d used for government verification last year, and she repeated, “Yeah, that was the same number, 321549876, right?”
    She emailed a scanned utility bill from ohine.smith92@gmail.com, which matched the billing address on her profile. Interestingly, the form also listed her backup email: jsmith_alt@protonmail.com.

    When asked for a payment method, she referred to her card: 4539 1488 0343 6467, and mentioned the zip tied to it was 62704. 
    Later she used a work phone number—(415) 333-9988—because her personal line (312-555-7890) was unreachable due to SIM issues.

    Mark’s contact was also attached in the document: m.wilson@ymail.com, along with his alternate number 773.444.1122. 
    Both addresses were marked under the “active contact file.”

    Jane’s DOB was written in one place as 1988-12-24 and another form had it as Dec 24, ‘88. 
    Her card billing address was mentioned simply as “same as home,” but one of the forms had “123 Elm St.” handwritten in.

    We noticed a number in the scanned form: 987654321, but it wasn’t clear whether it was a routing number or just a form ID.

    Lastly, the reference form included some redacted digits: XXXX-XXXX-XXXX-6467.
    """


    sensitive_data_json = {
        "EMAIL": "Any string that represents an email address",
        "SSN": "A US social security number in the format XXX-XX-XXXX",
        "PHONE": "US phone number in formats like (XXX) XXX-XXXX or XXX-XXX-XXXX",
        "CREDIT_CARD": "Any 16-digit number formatted like a credit card",
        "ADDRESS": "Home or office address containing street names, numbers, zip code, or city",
        "DOB": "Date of birth in formats like MM/DD/YYYY or YYYY-MM-DD"
    }

    print(extract_sensitive_entities(user_input, sensitive_data_json))
