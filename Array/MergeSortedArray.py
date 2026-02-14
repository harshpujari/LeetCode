from typing import List

class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """Merge sorted array nums2 into nums1 in-place.

        Time: O(m + n), Space: O(1) — fill from the back to avoid overwriting.
        After the call, `nums1` contains the first `m + n` elements in non-decreasing order.
        """
        # p1: last index of the initial part of nums1 (valid elements)
        p1 = m - 1
        # p2: last index of nums2
        p2 = n - 1
        # p: position to place the next largest element (fill from the end)
        p = m + n - 1

        # Place the larger of nums1[p1] and nums2[p2] at nums1[p], moving pointers left.
        while p1 >= 0 and p2 >= 0:
            if nums1[p1] > nums2[p2]:
                nums1[p] = nums1[p1]
                p1 -= 1
            else:
                nums1[p] = nums2[p2]
                p2 -= 1
            p -= 1

        # If any elements remain in nums2, copy them. (Remaining nums1 elements are already in place.)
        while p2 >= 0:
            nums1[p] = nums2[p2]
            p2 -= 1
            p -= 1
