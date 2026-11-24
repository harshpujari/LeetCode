"""
Graph representation — Type 1 (Adjacency Matrix) and Type 2 (Adjacency List)
for undirected, directed and weighted graphs.

Example graph used everywhere (n = 4 nodes, 0-indexed):

    0 ──── 1
    │    ╱
    │   ╱
    2 ──── 3

    edges          = [(0, 1), (0, 2), (1, 2), (2, 3)]
    weighted_edges = [(0, 1, 4), (0, 2, 1), (1, 2, 2), (2, 3, 5)]

For the directed versions, an edge (u, v) means u → v only.

Run:  python3 graph_representation.py
"""

INF = float("inf")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TYPE 1 — ADJACENCY MATRIX   (n x n grid, matrix[u][v] describes edge u → v)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def matrix_undirected(n: int, edges: list[tuple[int, int]]) -> list[list[int]]:
    matrix = [[0] * n for _ in range(n)]   # NOT [[0] * n] * n (that shares one row)
    for u, v in edges:
        matrix[u][v] = 1
        matrix[v][u] = 1                   # undirected → mirror it
    return matrix


def matrix_directed(n: int, edges: list[tuple[int, int]]) -> list[list[int]]:
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1                   # only u → v
    return matrix


def matrix_weighted_undirected(n: int, edges: list[tuple[int, int, int]]) -> list[list[float]]:
    # INF = "no edge" (0 could be a real weight). Distance from a node to itself is 0.
    matrix = [[INF] * n for _ in range(n)]
    for i in range(n):
        matrix[i][i] = 0
    for u, v, w in edges:
        matrix[u][v] = w
        matrix[v][u] = w
    return matrix


def matrix_weighted_directed(n: int, edges: list[tuple[int, int, int]]) -> list[list[float]]:
    matrix = [[INF] * n for _ in range(n)]
    for i in range(n):
        matrix[i][i] = 0
    for u, v, w in edges:
        matrix[u][v] = w
    return matrix


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TYPE 2 — ADJACENCY LIST   (adj[u] = list of neighbours of u)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def list_undirected(n: int, edges: list[tuple[int, int]]) -> list[list[int]]:
    adj = [[] for _ in range(n)]           # NOT [[]] * n (that shares one list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)                   # undirected → add both ways
    return adj


def list_directed(n: int, edges: list[tuple[int, int]]) -> list[list[int]]:
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)                   # only u → v
    return adj


def list_weighted_undirected(n: int, edges: list[tuple[int, int, int]]) -> list[list[tuple[int, int]]]:
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))              # store (neighbour, weight)
        adj[v].append((u, w))
    return adj


def list_weighted_directed(n: int, edges: list[tuple[int, int, int]]) -> list[list[tuple[int, int]]]:
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    return adj


# Dictionary version — handy when nodes are labels ("A", "B") or not 0..n-1
def list_dict_undirected(edges: list[tuple]) -> dict:
    from collections import defaultdict
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return dict(adj)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Demo
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def show_matrix(title: str, m: list[list]) -> None:
    print(f"\n{title}")
    print("      " + "  ".join(f"{j:>3}" for j in range(len(m))))
    for i, row in enumerate(m):
        cells = "  ".join(f"{'∞' if x == INF else x:>3}" for x in row)
        print(f"  {i:>2} [{cells} ]")


def show_list(title: str, adj) -> None:
    print(f"\n{title}")
    items = adj.items() if isinstance(adj, dict) else enumerate(adj)
    for u, nbrs in items:
        print(f"  {u}: {nbrs}")


if __name__ == "__main__":
    n = 4
    edges = [(0, 1), (0, 2), (1, 2), (2, 3)]
    weighted_edges = [(0, 1, 4), (0, 2, 1), (1, 2, 2), (2, 3, 5)]

    print("━━ TYPE 1 — ADJACENCY MATRIX ━━")
    show_matrix("Undirected", matrix_undirected(n, edges))
    show_matrix("Directed", matrix_directed(n, edges))
    show_matrix("Weighted undirected", matrix_weighted_undirected(n, weighted_edges))
    show_matrix("Weighted directed", matrix_weighted_directed(n, weighted_edges))

    print("\n━━ TYPE 2 — ADJACENCY LIST ━━")
    show_list("Undirected", list_undirected(n, edges))
    show_list("Directed", list_directed(n, edges))
    show_list("Weighted undirected  (neighbour, weight)", list_weighted_undirected(n, weighted_edges))
    show_list("Weighted directed  (neighbour, weight)", list_weighted_directed(n, weighted_edges))
    show_list("Dict version (labelled nodes)", list_dict_undirected([("A", "B"), ("A", "C"), ("B", "C"), ("C", "D")]))
