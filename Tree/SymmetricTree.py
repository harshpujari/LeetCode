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

# Solution 2
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        if not root:
            return True
        def main(b1,b2):
            if not b1 and not b2:
                return True
            if not b1 or not b2:
                return False
            return (
                b1.val ==b2.val and
                main(b1.left, b2.right) and
                main(b1.right, b2.left)
            )
        return main(root.left, root.right)
      
        
