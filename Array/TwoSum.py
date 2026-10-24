# solution 1
from typing import List
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range (len(nums)):
            for j in range (i):
                if nums[i]+nums[j]==target:
                    return [j,i]
# solution 2
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # value -> index
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i

# solution 3
class Solution:
    def twoSum(self,nums: List[int], target:int) -> List:
        arr = sorted((v,i) for i,v in enumerate(nums))
        left, right = 0, len(nums)-1
        while left < right:
            sum = arr[left][0] + arr[right][0]
            if sum == target:
                return [arr[left][1], arr[right][1]]
            elif sum < target:
                left += 1
            else:
                right -= 1
        return []
