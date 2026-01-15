from typing import List

class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # Initialize lists of sets for rows, columns, and boxes
        # We need 9 sets for each category (indexes 0-8)
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]

        for r in range(9):
            for c in range(9):
                val = board[r][c]

                # Check if the cell is filled (usually denoted by '.')
                if val == ".":
                    continue

                # Calculate the index for the 3x3 sub-box
                # r // 3 gives the vertical block (0, 1, or 2)
                # c // 3 gives the horizontal block (0, 1, or 2)
                box_index = (r // 3) * 3 + (c // 3)

                # Check constraints
                if (val in rows[r] or 
                    val in cols[c] or 
                    val in boxes[box_index]):
                    return False

                # If valid, add the value to the tracking sets
                rows[r].add(val)
                cols[c].add(val)
                boxes[box_index].add(val)

        return True
