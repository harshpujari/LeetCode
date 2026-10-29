from typing import List
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for num in nums:
            result^=num
        return result
    
'''
Why this works:

a XOR a = 0 (any number XOR'd with itself equals 0)
a XOR 0 = a (any number XOR'd with 0 equals itself)
XOR is commutative and associative

When you XOR all elements together, the pairs cancel out to 0, leaving only the single element.
Time Complexity: O(n)
Space Complexity: O(1)
'''