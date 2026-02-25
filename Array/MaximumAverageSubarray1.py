from typing import List

class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        # 1. Initialize the first window sum
        current_sum = sum(nums[:k])
        max_sum = current_sum
        
        # 2. Slide the window from index k to the end of the list
        for i in range(k, len(nums)):
            # Subtract the leftmost element and add the current element
            # nums[i-k] is the element leaving the window
            # nums[i] is the element entering the window
            current_sum += nums[i] - nums[i-k]
            
            # Update max_sum if the new window sum is larger
            if current_sum > max_sum:
                max_sum = current_sum
        
        # 3. Return the average
        return max_sum / k
