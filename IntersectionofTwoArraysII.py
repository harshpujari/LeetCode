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
        
#Follow-up 1: Both Arrays Sorted

def intersect_sorted(nums1, nums2):
    # If not sorted, sort them: nums1.sort(), nums2.sort()
    i = j = 0
    result = []
    
    while i < len(nums1) and j < len(nums2):
        if nums1[i] < nums2[j]:
            i += 1
        elif nums1[i] > nums2[j]:
            j += 1
        else:  # Equal
            result.append(nums1[i])
            i += 1
            j += 1
    
    return result

# Time Complexity: O(n + m) if already sorted, O(n log n + m log m) if sorting needed
# Space Complexity: O(1) excluding output

