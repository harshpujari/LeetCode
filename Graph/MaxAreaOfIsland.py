from typing import List

class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])

        def dfs(r: int, c: int) -> int:
            # Return 0 if out of bounds or at water/visited cell
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
                return 0
            
            # Mark the land cell as visited by sinking it to 0
            grid[r][c] = 0
            
            # Count current cell (1) plus all 4-directionally connected land
            return (1 + dfs(r + 1, c) 
                      + dfs(r - 1, c) 
                      + dfs(r, c + 1) 
                      + dfs(r, c - 1))

        max_area = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    max_area = max(max_area, dfs(r, c))
                    
        return max_area
