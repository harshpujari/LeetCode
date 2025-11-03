from typing import List
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:

        n = len(digits)

        # Traverse from right to left
        for i in range(n - 1, -1, -1):
            # If digit is less than 9, just increment and return
            if digits[i] < 9:
                digits[i] += 1
                return digits

            # If digit is 9, set it to 0 and continue (carry over)
            digits[i] = 0

        # If we reach here, all digits were 9 (e.g., [9,9,9] → [1,0,0,0])
        return [1] + digits