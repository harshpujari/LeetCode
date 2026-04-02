class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        
        # Continue until n becomes 1 or we find ourselves in a loop
        while n != 1 and n not in seen:
            seen.add(n)
            n = self.get_next(n)
            
        return n == 1

    def get_next(self, number: int) -> int:
        total_sum = 0
        while number > 0:
            # Get the last digit and remove it from the number
            number, digit = divmod(number, 10)
            total_sum += digit ** 2
        return total_sum
