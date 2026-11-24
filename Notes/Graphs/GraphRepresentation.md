# Graph Representation

There are two standard ways to store a graph in code:

| | Type 1 — Adjacency Matrix | Type 2 — Adjacency List |
|---|---|---|
| Shape | `n × n` grid | one list of neighbours per node |
| `matrix[u][v]` / `adj[u]` | is there an edge u → v (or its weight) | all nodes u points to |
| Space | **O(n²)** | **O(n + m)** |
| Is there an edge u → v? | **O(1)** | O(degree(u)) |
| Visit all neighbours of u | O(n), scans the whole row | **O(degree(u))** |
| Best for | small or dense graphs, Floyd–Warshall | almost everything else (BFS, DFS, Dijkstra, topo sort) |

`n` = number of nodes, `m` = number of edges.

Runnable code for everything below: [graph_representation.py](graph_representation.py)

---

## The example graph

`n = 4` nodes, 0-indexed.

```
    0 ──── 1
    │    ╱
    │   ╱
    2 ──── 3
```

```python
edges          = [(0, 1), (0, 2), (1, 2), (2, 3)]
weighted_edges = [(0, 1, 4), (0, 2, 1), (1, 2, 2), (2, 3, 5)]   # (u, v, weight)
```

- **Undirected:** the edge `(u, v)` can be walked both ways.
- **Directed:** the edge `(u, v)` means only **u → v**.

```
Directed version:   0 → 1,  0 → 2,  1 → 2,  2 → 3
```

---

## Type 1 — Adjacency Matrix

Make an `n × n` grid. The cell at row `u`, column `v` describes the edge from `u` to `v`.

### 1. Undirected

```python
def matrix_undirected(n, edges):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1
        matrix[v][u] = 1      # mirror it, because the edge goes both ways
    return matrix
```

```
        0    1    2    3
   0 [  0    1    1    0 ]
   1 [  1    0    1    0 ]
   2 [  1    1    0    1 ]
   3 [  0    0    1    0 ]
```

- **The matrix is symmetric:** `matrix[u][v] == matrix[v][u]`.
- **Row sum = degree** of the node. For example, row 2 sums to 3, so node 2 has 3 neighbours.

### 2. Directed

```python
def matrix_directed(n, edges):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1      # only u → v, no mirror
    return matrix
```

```
        0    1    2    3
   0 [  0    1    1    0 ]
   1 [  0    0    1    0 ]
   2 [  0    0    0    1 ]
   3 [  0    0    0    0 ]
```

- **Not symmetric:** `matrix[0][1] = 1` but `matrix[1][0] = 0`.
- **Row sum = out-degree:** edges leaving the node.
- **Column sum = in-degree:** edges entering the node.

### 3. Weighted

Store the **weight** instead of `1`. Use `∞` to mean "no edge", because `0` can be a real weight. The diagonal is `0`, since getting from a node to itself costs nothing.

```python
INF = float("inf")

def matrix_weighted_undirected(n, edges):
    matrix = [[INF] * n for _ in range(n)]
    for i in range(n):
        matrix[i][i] = 0
    for u, v, w in edges:
        matrix[u][v] = w
        matrix[v][u] = w      # drop this line for a directed weighted graph
    return matrix
```

The **weighted undirected** result is symmetric:

```
        0    1    2    3
   0 [  0    4    1    ∞ ]
   1 [  4    0    2    ∞ ]
   2 [  1    2    0    5 ]
   3 [  ∞    ∞    5    0 ]
```

The **weighted directed** result has only the upper triangle filled in this example:

```
        0    1    2    3
   0 [  0    4    1    ∞ ]
   1 [  ∞    0    2    ∞ ]
   2 [  ∞    ∞    0    5 ]
   3 [  ∞    ∞    ∞    0 ]
```

---

## Type 2 — Adjacency List

Make one list per node. `adj[u]` holds every node you can reach from `u` in one step.

### 1. Undirected

```python
def list_undirected(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)      # add both ways
    return adj
```

```
0: [1, 2]
1: [0, 2]
2: [0, 1, 3]
3: [2]
```

- **Each edge appears twice**, so the lists hold `2m` entries in total. Here that's 4 edges and 8 entries.

### 2. Directed

```python
def list_directed(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)      # only u → v
    return adj
```

```
0: [1, 2]
1: [2]
2: [3]
3: []
```

- **Each edge appears once**, so the lists hold `m` entries in total.
- **`len(adj[u])` = out-degree** of `u`.

### 3. Weighted

Store **`(neighbour, weight)`** pairs instead of just the neighbour.

```python
def list_weighted_undirected(n, edges):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))  # drop this line for a directed weighted graph
    return adj
```

**Weighted undirected:**

```
0: [(1, 4), (2, 1)]
1: [(0, 4), (2, 2)]
2: [(0, 1), (1, 2), (3, 5)]
3: [(2, 5)]
```

**Weighted directed:**

```
0: [(1, 4), (2, 1)]
1: [(2, 2)]
2: [(3, 5)]
3: []
```

Loop over it like this:

```python
for v, w in adj[u]:
    ...   # edge u → v with weight w
```

### Dictionary version

Use a dict when nodes are labels like `"A"` or `"B"`, or not numbered `0..n-1`:

```python
from collections import defaultdict

adj = defaultdict(list)
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)
```

```
A: ['B', 'C']
B: ['A', 'C']
C: ['A', 'B', 'D']
D: ['C']
```

---

## Cheat sheet

| | Matrix (Type 1) | List (Type 2) |
|---|---|---|
| **Undirected** | `m[u][v] = m[v][u] = 1` | `adj[u].append(v)`, `adj[v].append(u)` |
| **Directed** | `m[u][v] = 1` | `adj[u].append(v)` |
| **Weighted undirected** | `m[u][v] = m[v][u] = w`; fill with `INF` | `adj[u].append((v, w))`, `adj[v].append((u, w))` |
| **Weighted directed** | `m[u][v] = w`; fill with `INF` | `adj[u].append((v, w))` |

The only difference between undirected and directed is **the second line, the mirror**.

---

## Common pitfalls

1. **`[[0] * n] * n` is a bug.** It creates *one* row shared `n` times, so setting `m[0][1] = 1` sets column 1 in every row. Always build it with `[[0] * n for _ in range(n)]`. The same goes for `[[]] * n` with adjacency lists.

2. **1-indexed input** (nodes `1..n`, common on GFG and in LeetCode problems such as *Network Delay Time*). Either allocate `n + 1` slots and ignore index 0, or subtract 1 from every node as you read it.

   ```python
   adj = [[] for _ in range(n + 1)]
   ```

3. **Weighted matrix: "no edge" vs weight 0.** Don't use `0` for "no edge" if `0` can be a real weight. Use `INF` or `None`.

4. **Duplicate edges.** If the input has the same edge twice:
   - a matrix silently keeps only the last one, overwriting the earlier entry;
   - a list keeps both.

   For weighted graphs you usually want the minimum: `m[u][v] = min(m[u][v], w)`.

5. **LeetCode often gives an edge list.** Problems like *Number of Provinces* hand you a ready-made adjacency matrix (`isConnected`). Problems like *Course Schedule*, *Network Delay Time* and *Find if Path Exists* give `edges` or `prerequisites`, and you build the adjacency list yourself as the first step.
