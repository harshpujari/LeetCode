class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums:
            return 0

        # Pointer for unique elements
        k = 1  

        # Start from the second element
        for i in range(1, len(nums)):
            # If current number is different from the previous unique one
            if nums[i] != nums[i - 1]:
                nums[k] = nums[i]  # Move it to the next unique position
                k += 1

        return k

        
