# Solution 1:
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        return haystack.find(needle)

# Solution 2:
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        
        for i in range(n - m + 1):
            if haystack[i:i+m] == needle:
                return i
        return -1
