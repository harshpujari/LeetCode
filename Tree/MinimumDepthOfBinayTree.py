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
        
        # If both children exist, use your original logic
        return 1 + min(l, r)
