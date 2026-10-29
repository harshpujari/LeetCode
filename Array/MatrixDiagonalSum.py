class Solution:
    def diagonalSum(self, mat: list[list[int]]) -> int:
        n = len(mat)
        total = 0
        for i in range(n):
            total += mat[i][i] + mat[i][n - 1 - i]   # both diagonals in row i
        if n % 2:
            total -= mat[n // 2][n // 2]             # centre was counted twice
        return total
