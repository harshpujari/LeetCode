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
