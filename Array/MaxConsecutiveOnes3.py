from typing import List

class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        left = 0
        max_length = 0
        
        # We use len(nums) here because range is exclusive
        for right in range(len(nums)):
            # If we encounter a 0, we "spend" one of our k flips
            if nums[right] == 0:
                k -= 1
            
            # If we've spent too many flips (k < 0), 
            # we must shrink the window from the left
            while k < 0:
                if nums[left] == 0:
                    k += 1
                left += 1
            
            # The window [left, right] is now valid (contains <= k zeros)
            # Window size = (right - left + 1)
            current_window_size = right - left + 1
            if current_window_size > max_length:
                max_length = current_window_size
                
        return max_length
