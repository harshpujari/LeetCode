# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head):
        # 1. Find middle using slow/fast pointers
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # 2. Reverse second half in-place
        prev = None
        while slow:
            slow.next, prev, slow = prev, slow, slow.next

        # 3. Compare first half with reversed second half
        left, right = head, prev
        while right:  # right is shorter or equal
            if left.val != right.val:
                return False
            left = left.next
            right = right.next
        return True
        
