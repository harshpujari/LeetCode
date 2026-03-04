class Solution:
    def reverseBits(self, n: int) -> int:
        res = 0
        # We must loop exactly 32 times to account for all positions
        for _ in range(32):
            # 1. Shift result left to make room
            res = res << 1
            
            # 2. Get the rightmost bit of n and add it to res
            # We can use OR (|) or addition (+) here
            res = res | (n & 1)
            
            # 3. Shift n right to process the next bit
            n = n >> 1
            
        return res
