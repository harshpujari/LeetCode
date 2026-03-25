import pandas as pd

def duplicate_emails(person: pd.DataFrame) -> pd.DataFrame:
    # Find all rows where the email has appeared before
    duplicates = person[person.duplicated(subset=['email'])]
    # Return only the unique email addresses from those duplicates
    # and rename the column to 'Email' to match the expected output
    return duplicates[['email']].drop_duplicates().rename(columns={'email': 'Email'})
