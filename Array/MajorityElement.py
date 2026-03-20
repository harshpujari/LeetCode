from collections import Counter # 1. Added 's' to collections

class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        counts = Counter(nums)
        max_freq = -1 # 2. Track the highest count, not just the number
        result = None
        
        for i in nums:
            # 3. Check if this number's frequency is the highest we've seen
            if counts[i] > max_freq:
                max_freq = counts[i]
                result = i
                
        return result
