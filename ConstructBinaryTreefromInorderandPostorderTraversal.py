# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution(object):
    def buildTree(self, inorder, postorder):
        """
        :type inorder: List[int]
        :type postorder: List[int]
        :rtype: TreeNode
        """
        self.post_index = len(postorder)-1
        self.hash_index = {}
        for index, ele in enumerate(inorder):
            self.hash_index[ele] = index
        def func(l,r):
            if(l>r or not postorder):
                return None
            root_val = postorder[self.post_index]
            root = TreeNode(root_val)
            
            self.post_index-=1
            
            root.right = func(self.hash_index[root_val]+1, r)
            root.left = func(l, self.hash_index[root_val]-1)
            
            return root
            
        return func(0, len(inorder)-1)
