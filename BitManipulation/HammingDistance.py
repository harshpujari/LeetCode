class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        # The XOR operator (^) identifies where bits are different
        # .bit_count() then counts those differences
        return (x ^ y).bit_count()
