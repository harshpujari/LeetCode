class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r = 0, len(height) - 1
        best = 0
        while l < r:
            area = (r - l) * min(height[l], height[r])
            best = max(best, area)
            if height[l] < height[r]:
                l += 1          # move the shorter wall
            else:
                r -= 1
        return best
