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
# Boyer-Moore
class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        candidate = None
        count = 0
        
        for num in nums:
            if count == 0:
                candidate = num
            
            if num == candidate:
                count += 1
            else:
                count -= 1
                
        return candidate
