class Solution:
    def hammingWeight(self, n: int) -> int:
        return n.bit_count()


class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            # Check if the last bit is 1
            count += (n & 1)
            # Shift right to process the next bit
            n >>= 1
        return count

  class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            # This operation removes the rightmost set bit
            n &= (n - 1)
            count += 1
        return count
