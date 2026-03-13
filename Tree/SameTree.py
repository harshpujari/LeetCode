class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        def main(a, b):
            if not a and not b:
                return True
            if not a or not b:
                return False
            return (a.val == b.val and
                    main(a.left, b.left) and
                    main(a.right, b.right))
        
        return main(p, q)
