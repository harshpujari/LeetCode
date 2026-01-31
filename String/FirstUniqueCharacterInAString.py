from collections import Counter

class Solution:
    def firstUniqChar(self, s: str) -> int:
        char_count = Counter(s)
        for i in range(len(s)):
            if char_count[s[i]] == 1:
                return i
        return -1
