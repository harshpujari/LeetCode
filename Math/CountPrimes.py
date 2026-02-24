class Solution:
    def countPrimes(self, n: int) -> int:
        # 0 and 1 are not prime numbers, so if n is 0, 1, or 2, there are 0 primes less than n.
        if n <= 2:
            return 0
        
        # Initialize an array of boolean values representing prime status
        # We start by assuming all numbers from 0 to n-1 are prime
        primes = [True] * n
        
        # 0 and 1 are not primes
        primes[0] = primes[1] = False
        
        # We only need to check up to the square root of n
        for i in range(2, int(n**0.5) + 1):
            if primes[i]:
                # If i is prime, mark all of its multiples as False
                # We start crossing out from i*i because smaller multiples
                # would have already been crossed out by smaller prime factors.
                for j in range(i * i, n, i):
                    primes[j] = False
                    
        # The sum function counts the True values (since True is treated as 1 in Python)
        return sum(primes)
