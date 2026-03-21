class Solution:
    def titleToNumber(self, columnTitle: str) -> int:
        result = 0
        
        for char in columnTitle:
            # Get the numeric value of the letter (A=1, B=2...)
            # ord('A') is 65, so ord('A') - 64 = 1
            char_value = ord(char) - ord('A') + 1
            
            # Shift the existing result to the left (multiply by base 26)
            # and add the new value
            result = result * 26 + char_value
            
        return result
