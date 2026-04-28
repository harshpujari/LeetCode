# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def binaryTreePaths(self, root: Optional[TreeNode]) -> List[str]:
        # Edge case: empty tree
        if not root:
            return []
            
        result = []
        
        def dfs(node, current_path):
            if not node:
                return
            
            # Add the current node's value to the path
            current_path += str(node.val)
            
            # If we reach a leaf node, the path is complete
            if not node.left and not node.right:
                result.append(current_path)
                return
            
            # If not a leaf, append the arrow and continue searching
            current_path += "->"
            if node.left:
                dfs(node.left, current_path)
            if node.right:
                dfs(node.right, current_path)
                
        # Start the recursion from the root with an empty string
        dfs(root, "")
        
        return result
