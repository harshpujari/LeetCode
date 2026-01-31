class Solution:
    def reverse(self, x: int) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -2**31

        result = 0
        sign = 1 if x >= 0 else -1
        x = abs(x)

        while x:
            digit = x % 10
            x //= 10

            # Check overflow before multiplying/adding
            if result > (INT_MAX - digit) // 10:
                return 0

            result = result * 10 + digit

        return sign * result
            
        
