class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        # Create a hash map to store value -> last seen index
        seen = {}
        
        for i, n in enumerate(nums):
            # If n was seen before and the distance is <= k
            if n in seen and i - seen[n] <= k:
                return True
            
            # Update the dictionary with the latest index of n
            seen[n] = i
            
        return False
