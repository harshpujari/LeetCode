from collections import defaultdict
from typing import List

class Solution:
    def groupAnagrams(self, strings: List[str]) -> List[List[str]]:
        res = defaultdict(list)
        for word in strings:
            count = [0]*26
            print("this is word",word)
            for char in word:
              print("this is char",char)
              count[ord(char)-ord("a")]+=1
              print("this is count",count)
            res[tuple(count)].append(word)
            print("this is res",res)
        return res.values()
      
input_strings = ["eat", "tea", "tan", "ate", "nat", "bat"]

sol = Solution()
output = sol.groupAnagrams(input_strings)
