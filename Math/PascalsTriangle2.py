class Solution:
    def getRow(self, rowIndex: int) -> List[int]:
        # Start with the first element, which is always 1
        row = [1]
        
        for i in range(rowIndex):
            # Calculate the next term using the binomial coefficient formula:
            # next = current * (n - i) / (i + 1)
            # We use integer division // to keep results as integers
            next_val = row[-1] * (rowIndex - i) // (i + 1)
            row.append(next_val)
            
        return row
