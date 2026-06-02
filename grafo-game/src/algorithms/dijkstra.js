import { buildAdj, sortedIds, idleNodes, ek, fmt, INF } from './helpers'

export const pseudocode = [
  'para todo v: dist[v] ← ∞ ; π[v] ← nil',
  'dist[s] ← 0',
  'Q ← fila de prioridade com todos os vértices',
  'enquanto Q não vazio:',
  '  u ← extrair-mínimo(Q)   // vértice mais próximo',
  '  finaliza u',
  '  para cada vizinho v de u:',
  '    se dist[u] + w(u,v) < dist[v]:   // relaxa',
  '      dist[v] ← dist[u] + w(u,v) ; π[v] ← u',
]

function distTable(ids, dist, pi, visited) {
  return {
    type: 'table',
    title: 'Tabela de distâncias',
    columns: ['v', 'dist', 'π'],
    rows: ids.map((id) => ({
      cells: [id, fmt(dist[id]), pi[id] || '–'],
      state: visited.has(id) ? 'done' : dist[id] < INF ? 'active' : 'idle',
    })),
  }
}

function pqueue(ids, dist, visited, current) {
  const items = ids
    .filter((id) => !visited.has(id))
    .map((id) => ({ label: id, key: fmt(dist[id]), current: id === current }))
    .sort((a, b) => {
      const av = a.key === '∞' ? INF : Number(a.key)
      const bv = b.key === '∞' ? INF : Number(b.key)
      return av - bv
    })
  return { type: 'pqueue', title: 'Fila de prioridade (min-heap)', items }
}

export function* run(graph, startId) {
  const adj = buildAdj(graph)
  const ids = sortedIds(graph)
  const start = startId || ids[0]

  const dist = {}
  const pi = {}
  ids.forEach((id) => {
    dist[id] = INF
    pi[id] = null
  })
  dist[start] = 0
  const visited = new Set()
  const nodeStates = idleNodes(graph)
  const edgeStates = {}
  nodeStates[start] = 'active'

  yield {
    line: 1,
    message: `Inicialização: dist[${start}] = 0, todos os outros = ∞. Origem: ${start}.`,
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    dist: { ...dist },
    structures: [pqueue(ids, dist, visited, null), distTable(ids, dist, pi, visited)],
  }

  while (visited.size < ids.length) {
    // extract-min over unvisited
    let u = null
    let best = INF
    for (const id of ids) {
      if (!visited.has(id) && dist[id] < best) {
        best = dist[id]
        u = id
      }
    }
    if (u === null) break // remaining vertices unreachable

    nodeStates[u] = 'focus'
    yield {
      line: 4,
      message: `Extrai o vértice de menor distância: ${u} (dist = ${fmt(dist[u])}).`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      dist: { ...dist },
      structures: [pqueue(ids, dist, visited, u), distTable(ids, dist, pi, visited)],
    }

    visited.add(u)
    nodeStates[u] = 'done'

    for (const { to: v, w } of adj[u]) {
      if (visited.has(v)) continue
      const key = ek(u, v)
      edgeStates[key] = 'active'
      const ndist = dist[u] + w
      const improved = ndist < dist[v]
      yield {
        line: 7,
        message: improved
          ? `Relaxa (${u}→${v}): dist[${u}] + ${w} = ${fmt(dist[u])} + ${w} = ${ndist} < dist[${v}] = ${fmt(
              dist[v],
            )} ✓ atualiza.`
          : `Relaxa (${u}→${v}): ${fmt(dist[u])} + ${w} = ${ndist} ≥ dist[${v}] = ${fmt(
              dist[v],
            )} — não melhora.`,
        nodeStates: { ...nodeStates, [v]: improved ? 'active' : nodeStates[v] },
        edgeStates: { ...edgeStates },
        dist: { ...dist },
        structures: [pqueue(ids, dist, visited, u), distTable(ids, dist, pi, visited)],
      }
      if (improved) {
        // remove old tree edge into v, set the new one
        if (pi[v]) delete edgeStates[ek(pi[v], v)]
        dist[v] = ndist
        pi[v] = u
        edgeStates[key] = 'tree'
        if (nodeStates[v] === 'idle') nodeStates[v] = 'active'
      } else {
        edgeStates[key] = pi[v] === u ? 'tree' : 'idle'
      }
    }
  }

  // finalise: keep only tree edges
  const finalEdges = {}
  ids.forEach((id) => {
    if (pi[id]) finalEdges[ek(pi[id], id)] = 'tree'
  })
  yield {
    line: 8,
    done: true,
    message: `Concluído. A árvore de caminhos mínimos a partir de ${start} está destacada em verde.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, dist[id] < INF ? 'done' : 'idle'])),
    edgeStates: finalEdges,
    dist: { ...dist },
    structures: [distTable(ids, dist, pi, visited)],
  }
}
