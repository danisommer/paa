import { buildAdj, sortedIds, idleNodes, ek, fmt, INF } from './helpers'

export const pseudocode = [
  'para todo v: cor[v] ← branco, d[v] ← ∞, π[v] ← nil',
  'cor[s] ← cinza, d[s] ← 0, enfileira(Q, s)',
  'enquanto Q não vazio:',
  '  u ← desenfileira(Q)',
  '  para cada v adjacente a u:',
  '    se cor[v] = branco:',
  '      cor[v] ← cinza, d[v] ← d[u]+1, π[v] ← u, enfileira(Q, v)',
  '  cor[u] ← preto',
]

function distTable(ids, d, pi, colorOf) {
  return {
    type: 'table',
    title: 'Distâncias (nº de arestas)',
    columns: ['v', 'd', 'π'],
    rows: ids.map((id) => ({
      cells: [id, fmt(d[id]), pi[id] || '–'],
      state: colorOf(id),
    })),
  }
}

export function* run(graph, startId) {
  const adj = buildAdj(graph)
  const ids = sortedIds(graph)
  const start = startId || ids[0]

  const color = {}
  const d = {}
  const pi = {}
  ids.forEach((id) => {
    color[id] = 'white'
    d[id] = INF
    pi[id] = null
  })
  const nodeStates = idleNodes(graph)
  const edgeStates = {}

  const colorState = (id) =>
    color[id] === 'black' ? 'done' : color[id] === 'gray' ? 'active' : 'idle'

  color[start] = 'gray'
  d[start] = 0
  nodeStates[start] = 'active'
  const Q = [start]

  yield {
    line: 1,
    message: `Origem ${start}: d[${start}] = 0, cor = cinza, entra na fila.`,
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    dist: { ...d },
    structures: [
      { type: 'queue', title: 'Fila (FIFO)', items: Q.map((x) => ({ label: x })) },
      distTable(ids, d, pi, colorState),
    ],
  }

  while (Q.length) {
    const u = Q.shift()
    nodeStates[u] = 'focus'
    yield {
      line: 3,
      message: `Desenfileira ${u} e examina seus vizinhos.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      dist: { ...d },
      structures: [
        { type: 'queue', title: 'Fila (FIFO)', items: Q.map((x) => ({ label: x })) },
        distTable(ids, d, pi, colorState),
      ],
    }

    for (const { to: v } of adj[u]) {
      const key = ek(u, v)
      if (color[v] === 'white') {
        color[v] = 'gray'
        d[v] = d[u] + 1
        pi[v] = u
        Q.push(v)
        edgeStates[key] = 'tree'
        nodeStates[v] = 'active'
        yield {
          line: 6,
          message: `${v} é branco: descoberto via ${u}. d[${v}] = d[${u}]+1 = ${d[v]}. Entra na fila.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          dist: { ...d },
          structures: [
            { type: 'queue', title: 'Fila (FIFO)', items: Q.map((x) => ({ label: x })) },
            distTable(ids, d, pi, colorState),
          ],
        }
      } else {
        edgeStates[key] = edgeStates[key] || 'reject'
        yield {
          line: 5,
          message: `${v} já foi descoberto (cor ${color[v] === 'gray' ? 'cinza' : 'preto'}) — não cria aresta de árvore.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          dist: { ...d },
          structures: [
            { type: 'queue', title: 'Fila (FIFO)', items: Q.map((x) => ({ label: x })) },
            distTable(ids, d, pi, colorState),
          ],
        }
        if (edgeStates[key] === 'reject' && pi[v] !== u && pi[u] !== v) {
          // keep as a non-tree edge marker
        } else {
          delete edgeStates[key]
        }
      }
    }
    color[u] = 'black'
    nodeStates[u] = 'done'
  }

  const treeEdges = {}
  ids.forEach((id) => {
    if (pi[id]) treeEdges[ek(pi[id], id)] = 'tree'
  })
  yield {
    line: 7,
    done: true,
    message: `BFS concluída. A árvore de busca em largura (caminhos mínimos em nº de arestas) está em verde.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, d[id] < INF ? 'done' : 'idle'])),
    edgeStates: treeEdges,
    dist: { ...d },
    structures: [distTable(ids, d, pi, colorState)],
  }
}
