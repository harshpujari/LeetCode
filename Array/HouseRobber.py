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
