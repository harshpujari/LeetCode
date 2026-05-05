class Solution:
    def addDigits(self, num: int) -> int:
        # Continue looping as long as num has more than 1 digit
        while num > 9:
            total = 0
            while num > 0:
                total += num % 10
                num //= 10
            num = total
            
        return num

# some AI solution that I don't understand 
class Solution:
    def addDigits(self, num: int) -> int:
        if num == 0:
            return 0
        return 1 + (num - 1) % 9
