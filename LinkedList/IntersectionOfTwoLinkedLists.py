class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        # If either list is empty, there is no intersection
        if not headA or not headB:
            return None
        
        # Start two pointers at the heads of A and B
        ptrA = headA
        ptrB = headB
        
        # Loop until the two pointers meet
        while ptrA != ptrB:
            # Move to the next node, or switch to the other head if at the end
            ptrA = ptrA.next if ptrA else headB
            ptrB = ptrB.next if ptrB else headA
            
        # They will either meet at the intersection node OR both be None
        return ptrA
