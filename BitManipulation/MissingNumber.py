class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        res = n # Start with n because the loop only goes up to n-1
        
        for i in range(n):
            # XOR the index and the value
            res ^= i ^ nums[i]
            
        return res
