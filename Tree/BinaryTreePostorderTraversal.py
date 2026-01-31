# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def postorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
      def dfs(root):
        if root : 
          res.insert(0,root.val)
          r=dfs(root.right)
          l=dfs(root.left)
          return res
      res = []
      return dfs(root)
