class Solution:
    def intToRoman(self, num: int) -> str:
        values = [
            (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
            (100, "C"),  (90, "XC"),  (50, "L"),  (40, "XL"),
            (10, "X"),   (9, "IX"),   (5, "V"),   (4, "IV"),
            (1, "I"),
        ]
        res = []
        for val, sym in values:
            while num >= val:
                res.append(sym)
                num -= val
        return "".join(res)


class Solution:
    def intToRoman(self, num: int) -> str:
        th = ["", "M", "MM", "MMM"]
        h  = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
        t  = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"]
        o  = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
        return th[num // 1000] + h[num // 100 % 10] + t[num // 10 % 10] + o[num % 10]
