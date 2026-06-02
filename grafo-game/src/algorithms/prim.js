import { buildAdj, sortedIds, idleNodes, ek, fmt, INF } from './helpers'

export const pseudocode = [
  'para todo v: key[v] ← ∞, π[v] ← nil',
  'key[r] ← 0   // raiz',
  'Q ← todos os vértices',
  'enquanto Q não vazio:',
  '  u ← extrair-mínimo(Q)   // aresta leve do corte',
  '  para cada vizinho v de u em Q:',
  '    se w(u,v) < key[v]:',
  '      key[v] ← w(u,v), π[v] ← u',
]

function keyTable(ids, key, pi, inTree) {
  return {
    type: 'table',
    title: 'Chaves (key) e predecessor',
    columns: ['v', 'key', 'π'],
    rows: ids.map((id) => ({
      cells: [id, fmt(key[id]), pi[id] || '–'],
      state: inTree.has(id) ? 'done' : key[id] < INF ? 'active' : 'idle',
    })),
  }
}

function pqueue(ids, key, inTree, current) {
  const items = ids
    .filter((id) => !inTree.has(id))
    .map((id) => ({ label: id, key: fmt(key[id]), current: id === current }))
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
  const root = startId && ids.includes(startId) ? startId : ids[0]

  const key = {}
  const pi = {}
  ids.forEach((id) => {
    key[id] = INF
    pi[id] = null
  })
  key[root] = 0
  const inTree = new Set()
  const nodeStates = idleNodes(graph)
  const edgeStates = {}
  nodeStates[root] = 'active'
  let total = 0

  yield {
    line: 1,
    message: `Raiz ${root}: key[${root}] = 0, demais = ∞.`,
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    structures: [pqueue(ids, key, inTree, null), keyTable(ids, key, pi, inTree)],
  }

  while (inTree.size < ids.length) {
    let u = null
    let best = INF
    for (const id of ids) {
      if (!inTree.has(id) && key[id] < best) {
        best = key[id]
        u = id
      }
    }
    if (u === null) break

    inTree.add(u)
    nodeStates[u] = 'done'
    if (pi[u]) {
      edgeStates[ek(pi[u], u)] = 'tree'
      total += key[u]
    }
    yield {
      line: 4,
      message: pi[u]
        ? `Extrai ${u} (key = ${key[u]}). Adiciona aresta leve (${pi[u]}–${u}) de peso ${key[u]} à AGM. Total = ${total}.`
        : `Extrai a raiz ${u}.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structures: [pqueue(ids, key, inTree, u), keyTable(ids, key, pi, inTree)],
    }

    for (const { to: v, w } of adj[u]) {
      if (inTree.has(v)) continue
      const improved = w < key[v]
      const key2 = ek(u, v)
      edgeStates[key2] = 'active'
      yield {
        line: 6,
        message: improved
          ? `Aresta (${u}–${v}) peso ${w} < key[${v}] = ${fmt(key[v])} ✓ atualiza candidato de ${v}.`
          : `Aresta (${u}–${v}) peso ${w} ≥ key[${v}] = ${fmt(key[v])} — mantém.`,
        nodeStates: { ...nodeStates, [v]: improved ? 'active' : nodeStates[v] },
        edgeStates: { ...edgeStates },
        structures: [pqueue(ids, key, inTree, u), keyTable(ids, key, pi, inTree)],
      }
      if (improved) {
        if (pi[v]) delete edgeStates[ek(pi[v], v)]
        key[v] = w
        pi[v] = u
        if (nodeStates[v] === 'idle') nodeStates[v] = 'active'
      }
      edgeStates[key2] = pi[v] === u && !inTree.has(v) ? 'candidate' : 'idle'
    }
  }

  const treeEdges = {}
  ids.forEach((id) => {
    if (pi[id]) treeEdges[ek(pi[id], id)] = 'tree'
  })
  yield {
    line: 7,
    done: true,
    message: `AGM completa! Custo total = ${total}.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: treeEdges,
    structures: [keyTable(ids, key, pi, inTree)],
  }
}
