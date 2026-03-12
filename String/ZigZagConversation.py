class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows>len(s):
            return s
        rows = ["" for _ in range(numRows)]
        # print(rows)
        counter=0
        direction=1
        for char in s:
            # print(char)
            rows[counter]+=char
            if counter == 0:
                direction = 1
            elif counter == numRows-1:
                direction = -1
            counter+=direction
        return "".join(rows)
