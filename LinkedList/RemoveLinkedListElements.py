# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def removeElements(self, head: Optional[ListNode], val: int) -> Optional[ListNode]:
        # Create a dummy node that points to the head
        dummy = ListNode(next=head)
        curr = dummy
        
        while curr.next:
            if curr.next.val == val:
                # Skip the node by pointing to the one after it
                curr.next = curr.next.next
            else:
                # Only move forward if we didn't delete a node
                curr = curr.next
        
        return dummy.next
