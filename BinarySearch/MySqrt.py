class Solution:
    def mySqrt(self, x: int) -> int:
        l, r = 0, x
        while l <= r:
            mid = (l + r) // 2
            if mid * mid == x:
                return mid
            elif mid * mid < x:
                l = mid + 1
            else:
                r = mid - 1
        return r

    def mySqrt1(self, x: int) -> int:
        return int(x ** 0.5)
    
    def mySqrt2(self, x: int) -> int:
        r = x
        while r * r > x:
            r = (r + x // r) // 2
        return r



