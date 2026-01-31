class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        if not strs:
            return ""
        
        first = min(strs)
        last = max(strs)
        
        for i, c in enumerate(first):
            if c != last[i]:
                return first[:i]
        
        return first
