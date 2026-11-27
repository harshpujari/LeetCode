class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        lo, hi = 0, rows * cols - 1

        while lo <= hi:
            mid = (lo + hi) // 2
            row = mid // cols          # which row
            col = mid % cols           # which column within that row
            val = matrix[row][col]

            if val == target:
                return True
            elif val < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False