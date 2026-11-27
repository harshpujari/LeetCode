import random
class Solution:

    def __init__(self, nums: List[int]):
        self.original = list(nums)
        self.array = list(nums)

    def reset(self) -> List[int]:
        self.array = list(self.original)
        return self.array

    def shuffle(self) -> List[int]:
        random.shuffle(self.array)
        return self.array


# Your Solution object will be instantiated and called as such:
# obj = Solution(nums)
# param_1 = obj.reset()
# param_2 = obj.shuffle()
