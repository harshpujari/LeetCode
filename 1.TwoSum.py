class Solution :
  def two_sum(self, num:list[int],target:int):
    number_indices ={}
    for i , num in enumerate(num):
      compliment = target - num
      if compliment in number_indices :
        return [number_indices[compliment],i]
      number_indices[num] = i

instance = Solution()
result = instance.two_sum([2,7,11,15],9)
print(result)
