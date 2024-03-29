# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        def dfs(root):
            if not root : return []
            if root:
                res.append(root.val)
                left,right = dfs(root.left),dfs(root.right)
                return res
        res = []
        return dfs(root)
        
