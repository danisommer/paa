import { buildAdj, sortedIds, idleNodes, ek } from './helpers'

export const pseudocode = [
  'para todo v: cor[v] ← branco; tempo ← 0',
  'para cada u (ordem alfabética):',
  '  se cor[u] = branco: DFS-Visita(u)',
  'DFS-Visita(u):',
  '  tempo++; d[u] ← tempo; cor[u] ← cinza',
  '  para cada v adjacente a u:',
  '    se cor[v] = branco: aresta de ÁRVORE; DFS-Visita(v)',
  '    senão se cor[v] = cinza: aresta de RETORNO',
  '    senão se d[u] < d[v]: aresta de AVANÇO; senão CRUZAMENTO',
  '  tempo++; f[u] ← tempo; cor[u] ← preto',
]

const CLASS_LABEL = {
  tree: 'árvore',
  back: 'retorno',
  forward: 'avanço',
  cross: 'cruzamento',
}

export function* run(graph, startId) {
  const adj = buildAdj(graph)
  const ids = sortedIds(graph)
  const directed = graph.directed

  const color = {}
  const d = {}
  const f = {}
  ids.forEach((id) => {
    color[id] = 'white'
  })
  let time = 0
  const nodeStates = idleNodes(graph)
  const edgeStates = {}
  const classified = [] // {edge, type}

  const labels = () => {
    const l = {}
    ids.forEach((id) => {
      if (d[id] != null) l[id] = `${d[id]}/${f[id] != null ? f[id] : '·'}`
    })
    return l
  }

  const classStruct = () => ({
    type: 'classes',
    title: 'Classificação das arestas',
    items: classified.map((c) => ({ label: c.edge, type: c.type, name: CLASS_LABEL[c.type] })),
  })

  const timeStruct = () => ({
    type: 'table',
    title: 'Tempos (descoberta / fechamento)',
    columns: ['v', 'd', 'f'],
    rows: ids.map((id) => ({
      cells: [id, d[id] ?? '·', f[id] ?? '·'],
      state: color[id] === 'black' ? 'done' : color[id] === 'gray' ? 'active' : 'idle',
    })),
  })

  function* visit(u) {
    time++
    d[u] = time
    color[u] = 'gray'
    nodeStates[u] = 'focus'
    yield {
      line: 4,
      message: `Descobre ${u}: d[${u}] = ${time}, cor = cinza.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      labels: labels(),
      structures: [timeStruct(), classStruct()],
    }

    for (const { to: v } of adj[u]) {
      const key = ek(u, v)
      // For undirected graphs, skip the edge back to our parent's tree edge.
      if (!directed && edgeStates[ek(v, u)] === 'tree') continue

      if (color[v] === 'white') {
        edgeStates[key] = 'tree'
        classified.push({ edge: `${u}→${v}`, type: 'tree' })
        nodeStates[u] = 'active'
        yield {
          line: 6,
          message: `(${u}→${v}): ${v} é branco ⟹ aresta de ÁRVORE. Visita ${v}.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          labels: labels(),
          structures: [timeStruct(), classStruct()],
        }
        nodeStates[u] = 'focus'
        yield* visit(v)
        nodeStates[u] = 'focus'
      } else {
        let type
        let line
        if (color[v] === 'gray') {
          type = 'back'
          line = 7
        } else if (directed && d[u] < d[v]) {
          type = 'forward'
          line = 8
        } else if (directed) {
          type = 'cross'
          line = 8
        } else {
          // undirected non-tree, non-parent => back edge
          type = 'back'
          line = 7
        }
        edgeStates[key] = type
        classified.push({ edge: `${u}→${v}`, type })
        yield {
          line,
          message: `(${u}→${v}): ${v} é ${color[v] === 'gray' ? 'cinza' : 'preto'} ⟹ aresta de ${CLASS_LABEL[type].toUpperCase()}.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          labels: labels(),
          structures: [timeStruct(), classStruct()],
        }
      }
    }

    time++
    f[u] = time
    color[u] = 'black'
    nodeStates[u] = 'done'
    yield {
      line: 9,
      message: `Finaliza ${u}: f[${u}] = ${time}, cor = preto.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      labels: labels(),
      structures: [timeStruct(), classStruct()],
    }
  }

  const root = startId && ids.includes(startId) ? startId : ids[0]
  const order = [root, ...ids.filter((id) => id !== root)]
  for (const u of order) {
    if (color[u] === 'white') {
      yield {
        line: 2,
        message: `Inicia nova busca em profundidade a partir de ${u}.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        labels: labels(),
        structures: [timeStruct(), classStruct()],
      }
      yield* visit(u)
    }
  }

  yield {
    line: 9,
    done: true,
    message: `DFS concluída. Arestas classificadas: árvore (verde), retorno (vermelho), avanço (azul), cruzamento (roxo).`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: { ...edgeStates },
    labels: labels(),
    structures: [timeStruct(), classStruct()],
  }
}
