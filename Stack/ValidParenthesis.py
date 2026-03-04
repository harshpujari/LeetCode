class Solution:
    def isValid(self, s: str) -> bool:
        # Dictionary to keep track of mappings
        bracket_map = {")": "(", "}": "{", "]": "["}
        stack = []

        for char in s:
            if char in bracket_map:
                # This is a closing bracket
                # Pop the top element if stack isn't empty, else use a dummy value
                top_element = stack.pop() if stack else '#'
                
                # Check if the popped element matches the mapping
                if bracket_map[char] != top_element:
                    return False
            else:
                # This is an opening bracket, push it onto the stack
                stack.append(char)

        # If stack is empty, all brackets were matched
        return not stack
