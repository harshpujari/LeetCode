class MinStack:

    def __init__(self):
        # The stack will store tuples in the format: (value, current_min)
        self.stack = []

    def push(self, val: int) -> None:
        if not self.stack:
            # If the stack is empty, the current value is the minimum
            self.stack.append((val, val))
        else:
            # The new minimum is the smaller of the new value and the previous minimum
            current_min = self.stack[-1][1]
            self.stack.append((val, min(val, current_min)))

    def pop(self) -> None:
        if self.stack:
            self.stack.pop()

    def top(self) -> int:
        if self.stack:
            return self.stack[-1][0]
        return -1 # Optional: handle empty stack edge case

    def getMin(self) -> int:
        if self.stack:
            return self.stack[-1][1]
        return -1 # Optional: handle empty stack edge case
