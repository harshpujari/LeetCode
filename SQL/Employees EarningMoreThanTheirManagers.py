import pandas as pd

def find_employees(employee: pd.DataFrame) -> pd.DataFrame:
    # 1. Merge the table with itself
    # left_on='managerId' matches the employee's manager
    # right_on='id' finds that manager's specific record
    df = employee.merge(
        employee, 
        left_on='managerId', 
        right_on='id', 
        suffixes=('_emp', '_mgr')
    )
    
    # 2. Filter rows where employee salary is greater than manager salary
    result_df = df[df['salary_emp'] > df['salary_mgr']]
    
    # 3. Rename the column to match the expected output format
    return result_df[['name_emp']].rename(columns={'name_emp': 'Employee'})
