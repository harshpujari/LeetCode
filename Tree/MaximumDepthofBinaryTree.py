# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
      if root == None:
        return 0
      l,r = self.maxDepth(root.left), self.maxDepth(root.right)
      return 1 + max(l,r)

# BFS 
def maxDepth(self, root: Optional[TreeNode]) -> int:
    if not root:
        return 0
    queue = deque([root])
    depth = 0
    while queue:
        depth += 1
        for _ in range(len(queue)):  # process entire level
            node = queue.popleft()
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
    return depth

# DFS
def maxDepth(self, root: Optional[TreeNode]) -> int:
    if not root:
        return 0
    stack = [(root, 1)]
    max_depth = 0
    while stack:
        node, depth = stack.pop()
        max_depth = max(max_depth, depth)
        if node.left:  stack.append((node.left, depth + 1))
        if node.right: stack.append((node.right, depth + 1))
    return max_depth


# | Approach | Time | Space | When to use |
# |----------|------|-------|-------------|
# | Recursive DFS (yours) | O(n) | O(h) call stack | Clean, intuitive |
# | BFS | O(n) | O(w) width | When you need level info |
# | Iterative DFS | O(n) | O(h) | Avoid stack overflow on deep trees |

'''

