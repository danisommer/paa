import { sortedIds, idleNodes, ek, DSU } from './helpers'

export const pseudocode = [
  'A ← ∅   // arestas da AGM',
  'ordena as arestas por peso crescente',
  'para cada vértice v: cria-conjunto(v)',
  'para cada aresta (u,v) em ordem crescente:',
  '  se encontra(u) ≠ encontra(v):   // não forma ciclo',
  '    A ← A ∪ {(u,v)}',
  '    une(u, v)',
  '  senão: descarta (formaria ciclo)',
]

export function* run(graph, startId) {
  const ids = sortedIds(graph)
  const dsu = new DSU(ids)
  const nodeStates = idleNodes(graph)
  const edgeStates = {}

  // sort edges ascending by weight; ties broken alphabetically for determinism
  const edges = graph.edges
    .map((e) => ({ u: e.source, v: e.target, w: e.weight ?? 1 }))
    .sort((a, b) => a.w - b.w || (a.u + a.v < b.u + b.v ? -1 : 1))

  const sortedStruct = (idx, accepted) => ({
    type: 'edges',
    title: 'Arestas ordenadas (↑ peso)',
    items: edges.map((e, i) => ({
      label: `${e.u}–${e.v}`,
      w: e.w,
      state: accepted.has(i) ? 'tree' : i < idx ? 'reject' : i === idx ? 'active' : 'idle',
      current: i === idx,
    })),
  })

  const dsuStruct = () => ({
    type: 'unionfind',
    title: 'Conjuntos (Union-Find)',
    sets: dsu.groups(),
  })

  const accepted = new Set()
  let total = 0

  yield {
    line: 1,
    message: `Arestas ordenadas por peso crescente. Cada vértice começa em seu próprio conjunto.`,
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    structures: [sortedStruct(-1, accepted), dsuStruct()],
  }

  for (let i = 0; i < edges.length; i++) {
    const { u, v, w } = edges[i]
    const key = ek(u, v)
    edgeStates[key] = 'active'
    nodeStates[u] = 'focus'
    nodeStates[v] = 'focus'
    const ru = dsu.find(u)
    const rv = dsu.find(v)
    const cycle = ru === rv
    yield {
      line: 4,
      message: cycle
        ? `Aresta (${u}–${v}) peso ${w}: ${u} e ${v} já estão no mesmo conjunto ⟹ formaria CICLO. Descarta.`
        : `Aresta (${u}–${v}) peso ${w}: ${u} e ${v} em conjuntos diferentes ⟹ aceita na AGM.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structures: [sortedStruct(i, accepted), dsuStruct()],
    }

    if (!cycle) {
      dsu.union(u, v)
      accepted.add(i)
      total += w
      edgeStates[key] = 'tree'
      nodeStates[u] = 'done'
      nodeStates[v] = 'done'
      yield {
        line: 6,
        message: `Une os conjuntos de ${u} e ${v}. AGM agora soma ${total}.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        structures: [sortedStruct(i, accepted), dsuStruct()],
      }
    } else {
      edgeStates[key] = 'reject'
      nodeStates[u] = 'idle'
      nodeStates[v] = 'idle'
    }
    if (accepted.size === ids.length - 1) break
  }

  const treeEdges = {}
  Array.from(accepted).forEach((i) => {
    treeEdges[ek(edges[i].u, edges[i].v)] = 'tree'
  })
  yield {
    line: 7,
    done: true,
    message: `Árvore Geradora Mínima completa! ${accepted.size} arestas, custo total = ${total}.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: treeEdges,
    structures: [sortedStruct(edges.length, accepted), dsuStruct()],
  }
}
