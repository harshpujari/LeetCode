from collections import Counter
from typing import List
class Solution:
    def intersect(self, nums1: List[int], nums2: List[int]) -> List[int]:
        # Count frequencies in nums1
        count = Counter(nums1)
        result = []
    
        # For each element in nums2, if it exists in count, add to result
        for num in nums2:
            if count[num] > 0:
                result.append(num)
                count[num] -= 1

        return result
        