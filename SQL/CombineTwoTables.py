import pandas as pd

def combine_two_tables(person: pd.DataFrame, address: pd.DataFrame) -> pd.DataFrame:
    result = pd.merge(person, address, on='personId', how='left')
    
    # We only return the specific columns requested
    return result[['firstName', 'lastName', 'city', 'state']]