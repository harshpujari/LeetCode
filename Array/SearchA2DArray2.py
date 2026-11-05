class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        row, col = 0, len(matrix[0]) - 1         # start at the top-right
        while row < len(matrix) and col >= 0:
            val = matrix[row][col]
            if val == target:
                return True
            elif val > target:
                col -= 1                          # too big → go left
            else:
                row += 1                          # too small → go down
        return False
