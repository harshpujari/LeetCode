class Solution:
    def longestPalindrome(self, s: str) -> str:
        longest = ""

        for i in range(len(s)):
            # 1. Check for odd-length palindromes (single char center)
            l, r = i, i
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if (r - l + 1) > len(longest):
                    longest = s[l:r+1]
                l -= 1  # Expand outwards to the left
                r += 1  # Expand outwards to the right

            # 2. Check for even-length palindromes (two char center)
            l, r = i, i + 1
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if (r - l + 1) > len(longest):
                    longest = s[l:r+1]
                l -= 1
                r += 1

        return longest
