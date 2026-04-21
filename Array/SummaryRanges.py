class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        ranges = []
        i = 0
        n = len(nums)
        
        while i < n:
            start = nums[i]
            
            # Fast-forward the pointer as long as the sequence is consecutive
            while i + 1 < n and nums[i + 1] == nums[i] + 1:
                i += 1
                
            # Format the output based on whether the range has 1 or multiple elements
            if start == nums[i]:
                ranges.append(str(start))
            else:
                ranges.append(f"{start}->{nums[i]}")
                
            # Move to the start of the next potential sequence
            i += 1
            
        return ranges
