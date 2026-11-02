from collections import Counter

class Solution:
    def minAnagramLength(self, s: str) -> int:
        n = len(s)
        for L in range(1, n + 1):
            if n % L != 0:
                continue                      # blocks must divide s evenly
            first = Counter(s[:L])
            if all(Counter(s[i:i + L]) == first for i in range(L, n, L)):
                return L
        return n
