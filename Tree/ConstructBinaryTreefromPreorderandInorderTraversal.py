class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> TreeNode | None:
        if not preorder:
            return None

        root = TreeNode(preorder[0])
        mid = inorder.index(preorder[0])

        root.left = self.buildTree(preorder[1:mid + 1], inorder[:mid])
        root.right = self.buildTree(preorder[mid + 1:], inorder[mid + 1:])
        return root


class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> TreeNode | None:
        index_of = {val: i for i, val in enumerate(inorder)}
        pre_index = 0

        def build(left: int, right: int) -> TreeNode | None:
            nonlocal pre_index

            if left > right:
                return None

            root_val = preorder[pre_index]
            pre_index += 1
            root = TreeNode(root_val)

            mid = index_of[root_val]
            root.left = build(left, mid - 1)
            root.right = build(mid + 1, right)
            return root

        return build(0, len(inorder) - 1)