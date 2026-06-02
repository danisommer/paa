import { buildAdj, sortedIds, idleNodes, ek } from './helpers'

export const pseudocode = [
  '1ª DFS em G: calcula tempos de fechamento f[u]',
  'computa o grafo transposto Gᵀ (inverte as arestas)',
  '2ª DFS em Gᵀ, processando vértices em ordem decrescente de f[u]',
  'cada árvore da 2ª DFS é uma componente fortemente conexa',
]

const SCC_COLORS = ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#22d3ee']

export function* run(graph, startId) {
  void startId
  const ids = sortedIds(graph)
  const adj = buildAdj(graph) // out-edges of G (directed)
  const nodeStates = idleNodes(graph)
  let edgeStates = {}

  // transpose adjacency
  const adjT = {}
  ids.forEach((id) => (adjT[id] = []))
  graph.edges.forEach((e) => adjT[e.target].push({ to: e.source }))
  Object.values(adjT).forEach((l) => l.sort((a, b) => (a.to < b.to ? -1 : 1)))

  const color = {}
  ids.forEach((id) => (color[id] = 'white'))
  const f1 = {}
  const f2 = {}
  const comp = {}
  const nodeFill = {}
  let time = 0
  const finishStack = []

  const labelMap = () => {
    const l = {}
    ids.forEach((id) => {
      if (f1[id] != null || f2[id] != null) l[id] = `(${f1[id] ?? '·'},${f2[id] ?? '·'})`
    })
    return l
  }
  const stackStruct = () => ({
    type: 'list',
    title: 'Pilha de fechamento (1ª DFS)',
    items: [...finishStack].reverse().map((x) => ({ label: x })),
  })
  const compStruct = (groups) => ({
    type: 'groups',
    title: 'Componentes fortemente conexas',
    groups: groups.map((g, i) => ({ ids: g, color: SCC_COLORS[i % SCC_COLORS.length] })),
  })

  // ----- Phase 1 -----
  function* visit1(u) {
    color[u] = 'gray'
    nodeStates[u] = 'focus'
    yield {
      line: 0,
      message: `1ª DFS: descobre ${u}.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      labels: labelMap(),
      structures: [stackStruct()],
    }
    for (const { to: v } of adj[u]) {
      if (color[v] === 'white') {
        edgeStates[ek(u, v)] = 'tree'
        yield* visit1(v)
        nodeStates[u] = 'focus'
      }
    }
    color[u] = 'black'
    time++
    f1[u] = time
    finishStack.push(u)
    nodeStates[u] = 'done'
    yield {
      line: 0,
      message: `1ª DFS: finaliza ${u} (f = ${time}). Empilha ${u}.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      labels: labelMap(),
      structures: [stackStruct()],
    }
  }

  for (const u of ids) {
    if (color[u] === 'white') yield* visit1(u)
  }

  // ----- Transpose -----
  edgeStates = {}
  ids.forEach((id) => (nodeStates[id] = 'idle'))
  yield {
    line: 1,
    message: `1ª DFS pronta. Computa o grafo transposto Gᵀ (todas as arestas invertidas) e processa em ordem decrescente de fechamento.`,
    nodeStates: { ...nodeStates },
    edgeStates: {},
    labels: labelMap(),
    transpose: true,
    structures: [stackStruct()],
  }

  // ----- Phase 2 -----
  ids.forEach((id) => (color[id] = 'white'))
  let time2 = 0
  let compId = 0
  const groups = []

  function* visit2(u, members) {
    color[u] = 'gray'
    comp[u] = compId
    nodeFill[u] = SCC_COLORS[compId % SCC_COLORS.length]
    members.push(u)
    nodeStates[u] = 'focus'
    yield {
      line: 2,
      message: `2ª DFS em Gᵀ: ${u} entra na componente ${compId + 1}.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      labels: labelMap(),
      nodeFill: { ...nodeFill },
      transpose: true,
      structures: [stackStruct(), compStruct([...groups, members])],
    }
    for (const { to: v } of adjT[u]) {
      if (color[v] === 'white') {
        edgeStates[ek(v, u)] = 'tree' // original orientation
        yield* visit2(v, members)
      }
    }
    color[u] = 'black'
    time2++
    f2[u] = time2
    nodeStates[u] = 'done'
  }

  const order = [...finishStack].reverse() // decreasing finish time
  for (const u of order) {
    if (color[u] === 'white') {
      const members = []
      yield* visit2(u, members)
      groups.push(members.slice().sort())
      yield {
        line: 3,
        message: `Componente ${compId + 1} fechada: {${members.slice().sort().join(', ')}}.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        labels: labelMap(),
        nodeFill: { ...nodeFill },
        transpose: true,
        structures: [stackStruct(), compStruct(groups)],
      }
      compId++
    }
  }

  yield {
    line: 3,
    done: true,
    message: `Kosaraju concluído: ${groups.length} componente(s) fortemente conexa(s). Cada cor é uma CFC.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: { ...edgeStates },
    labels: labelMap(),
    nodeFill: { ...nodeFill },
    structures: [compStruct(groups)],
    groups,
  }
}
