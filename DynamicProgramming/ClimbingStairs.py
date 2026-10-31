class Solution:
    def climbStairs(self, n: int) -> int:
        # Base cases: 1 way to stay at step 0, 1 way to reach step 1
        prev2, prev1 = 1, 1
        
        for _ in range(2, n + 1):
            current = prev1 + prev2
            prev2 = prev1
            prev1 = current
            
        return prev1
