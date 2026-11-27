# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def minDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        
        l = self.minDepth(root.left)
        r = self.minDepth(root.right)
        
        # If the left child is missing, return the depth of the right side + 1
        # If the right child is missing, return the depth of the left side + 1
        if not root.left or not root.right:
            return 1 + l + r  # Since one is 0, adding them together gives the non-zero one
        return 1 + min(l, r)

# BFS
from collections import deque

class Solution:
    def minDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        
        # Queue stores tuples of (node, current_depth)
        queue = deque([(root, 1)])
        
        while queue:
            node, depth = queue.popleft()
            
            # The first leaf node we encounter tells us the min depth
            if not node.left and not node.right:
                return depth
            
            # Add children to the queue for the next level
            if node.left:
                queue.append((node.left, depth + 1))
            if node.right:
                queue.append((node.right, depth + 1))
        
        return 0
