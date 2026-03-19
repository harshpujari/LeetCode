class Solution:
    def convertToTitle(self, columnNumber: int) -> str:
        result = []
        
        while columnNumber > 0:
            # Shift to 0-indexed logic
            columnNumber -= 1
            
            # Get the remainder (the character value)
            remainder = columnNumber % 26
            
            # Convert to character (0 -> 'A', 1 -> 'B'...)
            char = chr(remainder + ord('A'))
            result.append(char)
            
            # Move to the next "digit"
            columnNumber //= 26
            
        # Since we built the string from right to left, reverse it
        return "".join(reversed(result))
