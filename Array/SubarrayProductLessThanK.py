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


class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0                        # products are ≥ 1, so none can be < k
        product = 1
        l = 0
        count = 0
        for r in range(len(nums)):
            product *= nums[r]              # grow the window to the right
            while product >= k:
                product //= nums[l]         # shrink from the left until valid
                l += 1
            count += r - l + 1              # subarrays ending at r
        return count
