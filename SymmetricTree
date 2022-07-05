# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isSymmetric(self, root):
        if root is None:
            return True
        stack = []
        stack.append(root.left)
        stack.append(root.right)

        while stack:
            x, y = stack.pop(), stack.pop()

            if x is None and y is None:
                continue

            if x is None or y is None or x.val != y.val:
                return False

            stack.append(x.left)
            stack.append(y.right)

            stack.append(x.right)
            stack.append(y.left)

        return True
