class Solution:
    def myAtoi(self, s: str) -> int:
        # 32-bit signed integer bounds
        INT_MIN, INT_MAX = -(2**31), 2**31 - 1

        # Step 1: Skip leading whitespace
        i = 0
        while i < len(s) and s[i] == ' ':
            i += 1

        # If we've reached the end, return 0
        if i == len(s):
            return 0

        # Step 2: Check for sign
        sign = 1
        if s[i] in ['+', '-']:
            sign = -1 if s[i] == '-' else 1
            i += 1

        # Step 3: Read digits
        result = 0
        while i < len(s) and s[i].isdigit():
            digit = int(s[i])

            # Check for overflow before adding the digit
            # If result > INT_MAX // 10, overflow will occur
            # If result == INT_MAX // 10 and digit > 7, overflow will occur
            if result > INT_MAX // 10 or (result == INT_MAX // 10 and digit > 7):
                return INT_MAX if sign == 1 else INT_MIN

            result = result * 10 + digit
            i += 1

        # Step 4: Apply sign and clamp to range
        return sign * result
        
