class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = nums1, nums2
        if len(A) > len(B):
            A, B = B, A  # ensure A is smaller

        m, n = len(A), len(B)
        lo, hi = 0, m

        while lo <= hi:
            i = (lo + hi) // 2          # partition index in A
            j = (m + n + 1) // 2 - i   # partition index in B

            Aleft  = A[i-1] if i > 0 else float('-inf')
            Aright = A[i]   if i < m else float('inf')
            Bleft  = B[j-1] if j > 0 else float('-inf')
            Bright = B[j]   if j < n else float('inf')

            if Aleft <= Bright and Bleft <= Aright:  # valid partition
                if (m + n) % 2 == 1:
                    return max(Aleft, Bleft)
                else:
                    return (max(Aleft, Bleft) + min(Aright, Bright)) / 2

            elif Aleft > Bright:
                hi = i - 1  # move left in A
            else:
                lo = i + 1  # move right in A
'''
### Step 1: The Goal (The Two Boxes)
The median is simply the middle point of a dataset. It means half the numbers are on the left, and half are on the right. Furthermore, every number on the left must be smaller than every number on the right.

So, our goal is to take Array `A` and Array `B`, and slice them both so that:
1. The **Left Box** and **Right Box** have the same number of elements.
2. The biggest numbers in the Left Box are smaller than the smallest numbers in the Right Box.

### Step 2: The Magic Capacity Formula
Before we start slicing, we need to know exactly how big our Left Box is supposed to be. 

Let's say the total number of elements across both arrays is $N$ (where $N = m + n$).
* If $N$ is **10** (even), the Left Box must hold exactly **5** elements.
* If $N$ is **11** (odd), we want the Left Box to hold the extra element, so it must hold exactly **6** elements. (This makes finding the median easy later—it's just the biggest number in the Left Box).

We need one mathematical formula that produces `5` when given `10`, and `6` when given `11`. We do this by adding 1 before using integer (floor) division:

$$\text{Target Capacity} = \lfloor \frac{m + n + 1}{2} \rfloor$$

* **For 10:** `(10 + 1) // 2` = `11 // 2` = **5**. (The remainder is dropped).
* **For 11:** `(11 + 1) // 2` = `12 // 2` = **6**. (The +1 bumps it up to an even number).

This formula is the engine of the algorithm. It dictates a strict, unchanging capacity for the Left Box.

### Step 3: The Seesaw Link (`i` and `j`)
Now we start slicing. 
* We place a divider in Array `A` at index `i`. This means we are putting `i` elements from Array `A` into the Left Box.
* We place a divider in Array `B` at index `j`. This means we are putting `j` elements from Array `B` into the Left Box.

Because the Left Box has a strict target capacity, `i` and `j` must always add up to that capacity.
$$i + j = \text{Target Capacity}$$

If we rearrange this, we find exactly where the divider in Array `B` *must* go based on where we put the divider in Array `A`:
$$j = \text{Target Capacity} - i$$

**This is the seesaw effect.** If we move the divider in `A` to the right (putting more `A` elements into the Left Box), the divider in `B` is mathematically forced to move to the left (kicking `B` elements out of the Left Box) to prevent the box from overflowing. 

Because they are locked together, we only ever have to search for the right spot in Array `A`. Array `B` will automatically follow.

### Step 4: Validating the Cut (The Cross-Check)
Let's say we make a random cut in `A`, and the math automatically makes the cut in `B`. How do we know if we found the right spot?

We look at the four numbers right next to our dividers:
* **`Aleft`**: The last element of `A` in the Left Box.
* **`Aright`**: The first element of `A` in the Right Box.
* **`Bleft`**: The last element of `B` in the Left Box.
* **`Bright`**: The first element of `B` in the Right Box.

Because the arrays are already sorted internally, we already know `Aleft <= Aright`. 
We just need to cross-check the diagonals:
1. Is **`Aleft <= Bright`**? (Is the biggest `A` on the left smaller than the smallest `B` on the right?)
2. Is **`Bleft <= Aright`**? 

If both are True, we found the perfect cut! 

### Step 5: Moving the Dividers (Binary Search)
If the cross-check fails, we need to move our dividers. *Remember: We don't move the numbers, we just move the line.*

* **If `Aleft > Bright`:** The line in `A` is too far to the right. It is including numbers that are too big for the Left Box. We need to slide the `A` divider to the left. (Which automatically slides the `B` divider right).
* **If `Bleft > Aright`:** The line in `B` is too far to the right. Because of our seesaw, the only way to slide the `B` divider left is to push the `A` divider to the right. 

We use Binary Search to slide the `A` divider, cutting the search space in half each time. This is why the algorithm is extremely fast—it runs in $O(\log(\min(m, n)))$ time.

### Step 6: Calculating the Final Median
Once the cross-check passes, we just look at our boxes to find the answer. (We also use `infinity` and `-infinity` to handle cases where a divider is pushed all the way to the edge of an array).

* **If total length is Odd:** The Left Box has one extra element. The median is simply the biggest number in the Left Box: `max(Aleft, Bleft)`.
* **If total length is Even:** The boxes are equal. The median is the average of the biggest number on the left and the smallest number on the right: `(max(Aleft, Bleft) + min(Aright, Bright)) / 2`.
'''
