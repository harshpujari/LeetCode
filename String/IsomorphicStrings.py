class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        return len(set(s)) == len(set(t)) == len(set(zip(s, t)))

class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        # Dictionary to store mapping from s to t and t to s
        map_st = {}
        map_ts = {}
        
        for char_s, char_t in zip(s, t):
            # Check if char_s is already mapped to something else
            if char_s in map_st and map_st[char_s] != char_t:
                return False
            
            # Check if char_t is already mapped from something else
            if char_t in map_ts and map_ts[char_t] != char_s:
                return False
            
            # Establish the mapping
            map_st[char_s] = char_t
            map_ts[char_t] = char_s
            
        return True
