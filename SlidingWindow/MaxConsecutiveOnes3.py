from typing import List

class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        left = 0
        right = 0
        
        for right in range(len(nums)):
            if nums[right] == 0:
                k -= 1
            
            # If k < 0, we are "illegal", but we don't use a 'while' loop.
            # We just shift the whole window one step to the right.
            if k < 0:
                if nums[left] == 0:
                    k += 1
                left += 1
        
        # At the end, the distance between right and left is the maximum
        # window size we ever achieved.
        return right - left + 1
