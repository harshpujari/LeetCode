# solution 1
from typing import List
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        counter = 0
        for i in range(len(nums) - 1, -1, -1):  # Go backwards
            if nums[i] == 0:
                nums.pop(i)
                counter += 1
        nums.extend([0] * counter)

# solution 2

class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        left = 0
        for right in range(len(nums)):
            if nums[right] != 0:
                nums[left], nums[right] = nums[right], nums[left]
                left += 1