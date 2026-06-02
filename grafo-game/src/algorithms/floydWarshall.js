import { sortedIds, idleNodes, fmt, INF } from './helpers'

export const pseudocode = [
  'D ← matriz de pesos (0 na diagonal, ∞ se não há aresta)',
  'para k de 1 até n:   // vértice intermediário',
  '  para i de 1 até n:',
  '    para j de 1 até n:',
  '      se D[i][k] + D[k][j] < D[i][j]:',
  '        D[i][j] ← D[i][k] + D[k][j]',
]

export function* run(graph, startId) {
  void startId
  const ids = sortedIds(graph)
  const n = ids.length
  const idx = Object.fromEntries(ids.map((id, i) => [i, id]))
  void idx

  // distance matrix
  const D = {}
  ids.forEach((i) => {
    D[i] = {}
    ids.forEach((j) => {
      D[i][j] = i === j ? 0 : INF
    })
  })
  graph.edges.forEach((e) => {
    const w = e.weight ?? 1
    D[e.source][e.target] = Math.min(D[e.source][e.target], w)
    if (!graph.directed) D[e.target][e.source] = Math.min(D[e.target][e.source], w)
  })

  const matrixStruct = (kHighlight, changed) => ({
    type: 'matrix',
    title: `Matriz de distâncias D${kHighlight != null ? ' (k=' + kHighlight + ')' : ''}`,
    head: ids,
    rows: ids.map((i) => ({
      label: i,
      cells: ids.map((j) => ({
        v: fmt(D[i][j]),
        changed: changed && changed.i === i && changed.j === j,
        diag: i === j,
      })),
    })),
    kCol: kHighlight,
  })

  const nodeStates = idleNodes(graph)

  yield {
    line: 0,
    message: `Matriz inicial D⁰: 0 na diagonal, peso das arestas, ∞ caso não exista aresta direta.`,
    nodeStates: { ...nodeStates },
    edgeStates: {},
    structures: [matrixStruct(null, null)],
  }

  for (const k of ids) {
    const ns = idleNodes(graph)
    ns[k] = 'focus'
    let improvements = 0
    for (const i of ids) {
      for (const j of ids) {
        if (D[i][k] + D[k][j] < D[i][j]) {
          D[i][j] = D[i][k] + D[k][j]
          improvements++
        }
      }
    }
    yield {
      line: 1,
      message: `Usando ${k} como intermediário: ${improvements} distância(s) melhorada(s). Caminhos i⇝${k}⇝j são considerados.`,
      nodeStates: ns,
      edgeStates: {},
      structures: [matrixStruct(k, null)],
    }
  }

  // negative cycle detection
  let negCycle = false
  ids.forEach((i) => {
    if (D[i][i] < 0) negCycle = true
  })

  yield {
    line: 5,
    done: true,
    message: negCycle
      ? `Atenção: D[i][i] < 0 para algum i ⟹ existe CICLO NEGATIVO no grafo.`
      : `Floyd-Warshall concluído. A matriz contém a distância mínima entre todos os pares. Complexidade Θ(V³).`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: {},
    structures: [matrixStruct(null, null)],
  }
  void n
}
