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

# --------------------------------------------------------------------------- #
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        # Use simple integers instead of Sets. 
        # 0 in binary is ...000000000 (Empty)
        rows = [0] * 9
        cols = [0] * 9
        boxes = [0] * 9

        for r in range(9):
            for c in range(9):
                val = board[r][c]
                
                # Skip empty cells
                if val == ".":
                    continue
                
                # OPTIMIZATION: Convert digit to a specific bit position
                # If val is "1", we shift '1' left by 1 position  -> 10 (binary)
                # If val is "5", we shift '1' left by 5 positions -> 100000 (binary)
                # We use int(val) directly to determine the shift.
                pos = 1 << int(val)

                # Calculate box index (same math as before)
                box_idx = (r // 3) * 3 + (c // 3)

                # CHECK: Bitwise AND (&)
                # If any of our storage integers already has this bit set to 1,
                # the result will be non-zero (True).
                if (rows[r] & pos) or (cols[c] & pos) or (boxes[box_idx] & pos):
                    return False
                
                # UPDATE: Bitwise OR (|)
                # This "turns on" the switch for this number.
                rows[r] |= pos
                cols[c] |= pos
                boxes[box_idx] |= pos
                
        return True
