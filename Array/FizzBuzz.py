class Solution:
    def fizzBuzz(self, n: int) -> list[str]:
        lst = []
        # Start at 1, end at n
        for i in range(1, n + 1):
            # Check the combined condition FIRST
            if i % 3 == 0 and i % 5 == 0:
                lst.append("FizzBuzz")
            elif i % 3 == 0:
                lst.append("Fizz")
            elif i % 5 == 0:
                lst.append("Buzz")
            else:
                lst.append(str(i))
        return lst
