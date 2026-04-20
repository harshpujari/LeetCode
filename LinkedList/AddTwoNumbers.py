class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        # Dummy node to simplify the code
        dummy = ListNode()
        current = dummy
        carry = 0

        while l1 or l2 or carry:
            # Extract digits and add them along with the carry
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            total = val1 + val2 + carry

            # Update carry for the next calculation
            carry = total // 10

            # Update current node's value
            current.next = ListNode(total % 10)
            current = current.next

            # Move to the next nodes if they exist
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next

        return dummy.next

# variation 1: when digits are in correct order
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        stack1, stack2 = [], []
        
        # 1. Push all values onto their respective stacks
        while l1:
            stack1.append(l1.val)
            l1 = l1.next
        while l2:
            stack2.append(l2.val)
            l2 = l2.next
            
        carry = 0
        head = None # We will build the new list backwards
        
        # 2. Pop from stacks to simulate right-to-left addition
        while stack1 or stack2 or carry:
            v1 = stack1.pop() if stack1 else 0
            v2 = stack2.pop() if stack2 else 0
            
            total = v1 + v2 + carry
            carry = total // 10
            
            # 3. Head Insertion Pattern
            new_node = ListNode(total % 10)
            new_node.next = head
            head = new_node
            
        return head
# Variation 1, Solution 2: 
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        """Helper function to reverse a linked list in-place."""
        prev = None
        current = head
        while current:
            next_node = current.next # Temporarily store the next node
            current.next = prev      # Reverse the pointer
            prev = current           # Move prev forward
            current = next_node      # Move current forward
        return prev

    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Step 1: Reverse both input lists
        l1 = self.reverseList(l1)
        l2 = self.reverseList(l2)
        
        # Step 2: Standard addition (grade-school math pattern)
        dummy_node = ListNode(0)
        current = dummy_node
        carry = 0
        
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            
            total = v1 + v2 + carry
            carry = total // 10
            
            current.next = ListNode(total % 10)
            current = current.next
            
            if l1: l1 = l1.next
            if l2: l2 = l2.next
            
        # Step 3: Reverse the final result back to forward order
        return self.reverseList(dummy_node.next)
