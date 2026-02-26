from itertools import accumulate

class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        return list(accumulate(nums))

  ##################
  class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        for i in range(1, len(nums)):
            # Update the current element by adding the previous one
            nums[i] += nums[i-1]
        return nums

  ################# 

class Solution:
def runningSum(self, nums: List[int]) -> List[int]:
  return [sum(nums[0:i+1]) for i in range(len(nums))]
