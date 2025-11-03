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

#Follow-up 2: One Array is Much Smaller
def intersect_small_nums1(nums1, nums2):
    from collections import Counter
    
    # Always count the smaller array
    count = Counter(nums1)  # nums1 is smaller
    result = []
    
    for num in nums2:
        if count[num] > 0:
            result.append(num)
            count[num] -= 1
    
    return result

# Follow-up 3: nums2 on Disk, Limited Memory

def intersect_disk_limited_memory(nums1, nums2_chunks):
    from collections import Counter
    
    # Load smaller array (nums1) into memory
    count = Counter(nums1)
    result = []
    
    # Process nums2 in chunks from disk
    for chunk in nums2_chunks:  # Each chunk is a portion of nums2
        for num in chunk:
            if count[num] > 0:
                result.append(num)
                count[num] -= 1
    
    return result