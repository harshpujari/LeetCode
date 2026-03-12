class Solution:
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1

        while left < right:
            # Skip non-alphanumeric characters from the left
            if not s[left].isalnum():
                left += 1
            # Skip non-alphanumeric characters from the right
            elif not s[right].isalnum():
                right -= 1
            # If both are valid, compare them (ignoring case)
            elif s[left].lower() != s[right].lower():
                return False
            # If they match, move both pointers inward
            else:
                left += 1
                right -= 1
                
        return True
