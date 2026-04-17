class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        # Base case: if the node is None, we've reached a leaf's child
        if not root:
            return None
        
        # Swap the left and right children
        root.left, root.right = root.right, root.left
        
        # Recursively call the function on the new left and right children
        self.invertTree(root.left)
        self.invertTree(root.right)
        
        # Return the root of the inverted tree
        return root
