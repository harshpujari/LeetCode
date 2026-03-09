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
# solution 2 
class Solution:
    def longestPalindrome(self, s: str) -> str:
        
        # Helper now returns an integer: the length of the palindrome
        def expand_around_center(l: int, r: int) -> int:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            # The length of the valid palindrome is calculated by:
            # (right_boundary - 1) - (left_boundary + 1) + 1 = r - l - 1
            return r - l - 1

        start = 0
        max_len = 0

        for i in range(len(s)):
            # Get lengths of potential palindromes
            len1 = expand_around_center(i, i)       # Odd length
            len2 = expand_around_center(i, i + 1)   # Even length
            
            # Find the max length centered at index i
            curr_max = max(len1, len2)

            # If we found a longer palindrome, update our tracking variables
            if curr_max > max_len:
                max_len = curr_max
                
                # The tricky math: calculate the start index using the center 'i' and the length
                start = i - (max_len - 1) // 2

        # Slice the string exactly once at the end
        return s[start : start + max_len]
