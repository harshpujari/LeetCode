class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(r: int, c: int, index: int) -> bool:
            if index == len(word):
                return True
            if (
                r < 0 or r >= rows or
                c < 0 or c >= cols or
                board[r][c] != word[index]
            ):
                return False

            temp = board[r][c]
            board[r][c] = "#"  # mark as visited

            found = (
                dfs(r + 1, c, index + 1) or
                dfs(r - 1, c, index + 1) or
                dfs(r, c + 1, index + 1) or
                dfs(r, c - 1, index + 1)
            )

            board[r][c] = temp  # backtrack
            return found

        for r in range(rows):
            for c in range(cols):
                if board[r][c] == word[0] and dfs(r, c, 0):
                    return True

        return False
