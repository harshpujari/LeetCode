from typing import List

class Solution:
    '''
    takes about 26MB and 1000ms
    '''
    def rotate(self, nums: List[int], k: int) -> None:
        k = k % len(nums)
        while k > 0:
            nums.insert(0, nums.pop())
            k -= 1

class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        '''
        takes about 26MB and 10ms
        '''
        n = len(nums)
        k = k % n  # Handle cases where k > n
        
        # Reverse entire array
        self.reverse(nums, 0, n - 1)
        # Reverse first k elements
        self.reverse(nums, 0, k - 1)
        # Reverse remaining elements
        self.reverse(nums, k, n - 1)
    
    def reverse(self, nums: List[int], left: int, right: int) -> None:
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1