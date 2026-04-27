class MyQueue:

    def __init__(self):
        # stack_in receives all new elements
        self.stack_in = []
        # stack_out provides elements for pop and peek
        self.stack_out = []

    def push(self, x: int) -> None:
        """Push element x to the back of queue."""
        self.stack_in.append(x)

    def pop(self) -> int:
        """Removes the element from in front of queue and returns that element."""
        self._move_in_to_out()
        return self.stack_out.pop()

    def peek(self) -> int:
        """Get the front element."""
        self._move_in_to_out()
        return self.stack_out[-1]

    def empty(self) -> bool:
        """Returns whether the queue is empty."""
        return not self.stack_in and not self.stack_out

    def _move_in_to_out(self) -> None:
        """Internal helper to transfer elements if stack_out is empty."""
        if not self.stack_out:
            while self.stack_in:
                self.stack_out.append(self.stack_in.pop())
