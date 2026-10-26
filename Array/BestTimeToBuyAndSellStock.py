class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price)
        return max_profit

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        l, best = 0, 0                  # l = buy day
        for r in range(1, len(prices)): # r = sell day
            if prices[r] < prices[l]:
                l = r                   # found a cheaper buy day, move l to it
            else:
                best = max(best, prices[r] - prices[l])
        return best
