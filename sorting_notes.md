| Algorithm | Space | Time (Best/Avg/Worst) | Real Usecase | Advantage | Disadvantage | When to Use | When NOT to Use |
|-----------|-------|----------------------|--------------|-----------|--------------|-------------|-----------------|
| **Quick Sort** | O(log n) | O(n log n) / O(n log n) / O(n²) | General purpose sorting in C++ std::sort (hybrid) | Fastest average case, good cache locality, in-place | Unstable, O(n²) worst case, not adaptive | Random/average data, speed matters, memory limited | Nearly sorted data, need stability, guaranteed performance |
| **Merge Sort** | O(n) | O(n log n) / O(n log n) / O(n log n) | External sorting (databases), stable sorting | Stable, guaranteed O(n log n), parallelizable | O(n) extra space, slower than Quicksort | Need stability, guaranteed performance, large datasets on disk | Memory constrained, small arrays |
| **Heap Sort** | O(1) | O(n log n) / O(n log n) / O(n log n) | Embedded systems, memory-critical apps | O(1) space, guaranteed O(n log n), in-place | Poor cache locality (2-3x slower in practice), unstable, not adaptive | Memory severely limited, need guaranteed bounds | Speed critical, nearly sorted data |
| **Timsort** | O(n) | O(n) / O(n log n) / O(n log n) | Python's default, Java's Arrays.sort | Stable, adaptive to patterns, great on real-world data | O(n) space, complex implementation | General purpose, partially sorted data, need stability | Memory constrained, simple implementation needed |
| **Insertion Sort** | O(1) | O(n) / O(n²) / O(n²) | Small arrays (<10-50), nearly sorted data, Timsort's subroutine | Simple, O(n) on nearly sorted, O(1) space, stable, adaptive | O(n²) on random data | Small datasets, nearly sorted, online sorting | Large random datasets |
| **Bubble Sort** | O(1) | O(n) / O(n²) / O(n²) | Educational purposes only | Simple to understand, stable, detects sorted arrays | Slowest practical algorithm | Teaching, never in production | Literally everything else |
| **Selection Sort** | O(1) | O(n²) / O(n²) / O(n²) | Minimizing swaps (e.g., flash memory) | O(1) space, minimal swaps (n-1), simple | Always O(n²), unstable, not adaptive | Write operations expensive, tiny datasets | Any normal use case |
| **Radix Sort** | O(n+k) | O(d(n+k)) / O(d(n+k)) / O(d(n+k)) | Sorting integers, strings with fixed length | Linear time for integers, stable | Only works on integers/strings, extra space, not comparison-based | Large integer datasets, fixed-length keys | Variable-length data, floats, objects |
| **Counting Sort** | O(k) | O(n+k) / O(n+k) / O(n+k) | Sorting small-range integers (0-1000) | Linear time, stable | Only works when range k is small, O(k) space | Small range integers, histogram data | Large range, non-integers, memory limited |

**Key:**
- k = range of input values
- d = number of digits
- n = number of elements