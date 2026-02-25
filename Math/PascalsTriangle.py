class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        # Initialize the triangle with the first row
        triangle = [[1]]
        
        for i in range(1, numRows):
            # Start every row with a 1
            prev_row = triangle[i-1]
            current_row = [1]
            
            # Calculate the middle elements
            # j goes from 1 to the index before the last
            for j in range(1, i):
                current_row.append(prev_row[j-1] + prev_row[j])
            
            # End every row with a 1
            current_row.append(1)
            
            # Add the completed row to our triangle
            triangle.append(current_row)
            
        return triangle
