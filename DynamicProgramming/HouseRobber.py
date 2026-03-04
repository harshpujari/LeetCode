class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums: return 0
        if len(nums) == 1: return nums[0]

        # Create an array to store our maximums
        dp = [0] * len(nums)

        # Base cases for the first two houses
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])

        # Walk down the rest of the street using our rule
        for i in range(2, len(nums)):
            dp[i] = max(nums[i] + dp[i-2], dp[i-1])

        return dp[-1] # The last item in the array is our final answer

# optimized solution 
from typing import List

class Solution:
    def rob(self, nums: List[int]) -> int:
        # rob1 represents the max money up to the house BEFORE the previous one (i-2)
        # rob2 represents the max money up to the PREVIOUS house (i-1)
        rob1, rob2 = 0, 0
        
        for n in nums:
            # Calculate the max money if we include the current house 'n'
            current_max = max(n + rob1, rob2)
            
            # Shift our variables forward for the next iteration
            rob1 = rob2
            rob2 = current_max
            
        # After iterating through all houses, rob2 holds the final max amount
        return rob2
