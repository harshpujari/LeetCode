class Solution:
    def pivotIndex(self, nums: list[int]) -> int:
        for i in range(len(nums)):
            if sum(nums[:i])==sum(nums[i+1:]):
                return i
        return -1

class Solution:
  def pivotIndex(self, nums: list[int]) -> int:
      total = sum(nums)
      left = 0
      for i, x in enumerate(nums):
          right = total - left - x      # everything after i
          if left == right:
              return i
          left += x                     # include x before moving on
      return -1
