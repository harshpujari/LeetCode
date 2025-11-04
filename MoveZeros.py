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