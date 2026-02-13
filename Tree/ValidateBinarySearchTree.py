# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return validate(node.left, low, node.val) and validate(node.right, node.val, high)
        
        return validate(root, float('-inf'), float('inf'))

#############################I like this version better#######################################
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(lower, node, upper):
            if not node:
                return True
            if not (lower < node.val < upper):
                return False
            return validate(lower, node.left, node.val) and validate(node.val, node.right, upper)

        return validate(float('-inf'), root, float('inf'))
        
