class Solution:
    def isUgly(self, n: int) -> bool:
        # Ugly numbers must be positive
        if n <= 0:
            return False
        
        # Repeatedly divide by the allowed prime factors
        for factor in [2, 3, 5]:
            while n % factor == 0:
                n //= factor
                
        # If we are left with 1, it's an ugly number
        return n == 1
