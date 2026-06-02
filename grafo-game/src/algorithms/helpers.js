// Shared utilities for the step-generating algorithms.
//
// Every algorithm is a generator (function*) that yields immutable "step"
// snapshots. A step has the shape:
//   {
//     line:        index into the algorithm's pseudocode array (highlighted)
//     message:     human friendly explanation of the step (pt-BR)
//     nodeStates:  { [id]: 'idle' | 'active' | 'focus' | 'done' }
//     edgeStates:  { ['u->v']: 'idle'|'tree'|'active'|'reject'|'back'|'forward'|'cross' }
//     dist:        { [id]: number } | null   (distances shown over nodes)
//     labels:      { [id]: string } | null   (extra small label under a node)
//     structures:  StepStructure[]           (rendered by StepPanel)
//     done:        boolean                    (true on the final summary step)
//   }
//
// The host collects all steps into an array (collect) so the player can step
// forward / backward freely.

export const INF = Infinity

export function fmt(x) {
  return x === INF ? '∞' : String(x)
}

// Canonical edge key used everywhere.
export function ek(u, v) {
  return `${u}->${v}`
}

// Build an adjacency list. Adjacencies are sorted alphabetically by target so
// traversal order matches the convention used in the prova ("ordem alfabética").
export function buildAdj(graph) {
  const adj = {}
  graph.nodes.forEach((n) => {
    adj[n.id] = []
  })
  graph.edges.forEach((e) => {
    const w = e.weight ?? 1
    adj[e.source].push({ to: e.target, w })
    if (!graph.directed) adj[e.target].push({ to: e.source, w })
  })
  Object.values(adj).forEach((list) =>
    list.sort((a, b) => (a.to < b.to ? -1 : a.to > b.to ? 1 : 0)),
  )
  return adj
}

// Sorted list of node ids (alphabetical).
export function sortedIds(graph) {
  return graph.nodes.map((n) => n.id).sort()
}

// Collect a generator into a plain array of steps.
export function collect(gen) {
  const out = []
  for (const s of gen) out.push(s)
  return out
}

// Deep-ish clone for the small plain-object maps we yield.
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Initialise a nodeStates map with every vertex idle.
export function idleNodes(graph) {
  const s = {}
  graph.nodes.forEach((n) => (s[n.id] = 'idle'))
  return s
}

// --- Disjoint set (union-find) used by Kruskal -------------------------------
export class DSU {
  constructor(ids) {
    this.parent = {}
    this.rank = {}
    ids.forEach((id) => {
      this.parent[id] = id
      this.rank[id] = 0
    })
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }
  union(a, b) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra
    } else {
      this.parent[rb] = ra
      this.rank[ra]++
    }
    return true
  }
  // Returns the current grouping as an array of id-arrays (for visualisation).
  groups() {
    const map = {}
    Object.keys(this.parent).forEach((id) => {
      const r = this.find(id)
      ;(map[r] = map[r] || []).push(id)
    })
    return Object.values(map).map((g) => g.sort())
  }
}
