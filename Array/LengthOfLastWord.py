def lengthOfLastWord(s: str) -> int:
    return len(s.split()[-1])

def lengthOfLastWord(s: str) -> int:
    i = len(s) - 1
    
    # Skip trailing spaces
    while i >= 0 and s[i] == ' ':
        i -= 1
    
    # Count the last word
    length = 0
    while i >= 0 and s[i] != ' ':
        length += 1
        i -= 1
    
    return length
