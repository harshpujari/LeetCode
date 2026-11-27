from typing import List

class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result = []
        
        def backtrack(index: int, current_combination: List[int], current_sum: int):
            # Base case: valid combination found
            if current_sum == target:
                result.append(current_combination.copy())
                return
            
            # Base case: out of bounds or exceeded target
            if index >= len(candidates) or current_sum > target:
                return
            
            # Choice 1: Include candidates[index] and stay on the same index (allows reuse)
            current_combination.append(candidates[index])
            backtrack(index, current_combination, current_sum + candidates[index])
            
            # Backtrack: remove the last added element before exploring the next choice
            current_combination.pop()
            
            # Choice 2: Skip candidates[index] and move to the next candidate
            backtrack(index + 1, current_combination, current_sum)
            
        backtrack(0, [], 0)
        return result
