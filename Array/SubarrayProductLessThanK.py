# Bruteforce
class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        count = 0
        n = len(nums)
        for i in range(n):              # start of subarray
            product = 1
            for j in range(i, n):       # end of subarray
                product *= nums[j]      # extend by one element
                if product < k:
                    count += 1
                else:
                    break               # all nums ≥ 1, so the product can only grow
        return count
