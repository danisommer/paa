import { buildAdj, sortedIds, idleNodes, ek } from './helpers'

export const pseudocode = [
  'calcula grau de entrada de todos os vértices',
  'F ← lista vazia',
  'enquanto existir vértice com grau de entrada 0:',
  '  u ← vértice-fonte (grau de entrada 0, ordem alfabética)',
  '  insere u no fim de F',
  '  para cada aresta (u,w): remove a aresta (grau[w]--)',
  'se sobraram vértices ⟹ há ciclo (não é DAG)',
]

export function* run(graph, startId) {
  void startId
  const adj = buildAdj(graph) // directed adjacency (out-edges)
  const ids = sortedIds(graph)
  const nodeStates = idleNodes(graph)
  const edgeStates = {}

  const indeg = {}
  ids.forEach((id) => (indeg[id] = 0))
  graph.edges.forEach((e) => {
    indeg[e.target] = (indeg[e.target] || 0) + 1
  })

  const removed = new Set()
  const F = []

  const indegStruct = () => ({
    type: 'table',
    title: 'Grau de entrada',
    columns: ['v', 'g.entrada'],
    rows: ids.map((id) => ({
      cells: [id, removed.has(id) ? '–' : indeg[id]],
      state: removed.has(id) ? 'done' : indeg[id] === 0 ? 'active' : 'idle',
    })),
  })
  const fStruct = () => ({
    type: 'list',
    title: 'F — ordenação topológica',
    ordered: true,
    items: F.map((x) => ({ label: x })),
  })

  yield {
    line: 0,
    message: `Calcula o grau de entrada de cada vértice. Fontes (grau 0) ficam em amarelo.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, indeg[id] === 0 ? 'active' : 'idle'])),
    edgeStates: { ...edgeStates },
    structures: [indegStruct(), fStruct()],
  }

  while (removed.size < ids.length) {
    // pick alphabetical source with indeg 0
    let u = null
    for (const id of ids) {
      if (!removed.has(id) && indeg[id] === 0) {
        u = id
        break
      }
    }
    if (u === null) {
      // cycle
      const remaining = ids.filter((id) => !removed.has(id))
      yield {
        line: 6,
        done: true,
        message: `Não há mais fontes, mas restam vértices {${remaining.join(', ')}} ⟹ o grafo tem um CICLO (não é DAG).`,
        nodeStates: Object.fromEntries(
          ids.map((id) => [id, removed.has(id) ? 'done' : 'focus']),
        ),
        edgeStates: { ...edgeStates },
        structures: [indegStruct(), fStruct()],
      }
      return
    }

    nodeStates[u] = 'focus'
    yield {
      line: 3,
      message: `${u} tem grau de entrada 0 ⟹ é uma fonte. Será o próximo da ordenação.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structures: [indegStruct(), fStruct()],
    }

    F.push(u)
    removed.add(u)
    nodeStates[u] = 'done'

    for (const { to: w } of adj[u]) {
      if (removed.has(w)) continue
      edgeStates[ek(u, w)] = 'reject'
      indeg[w]--
    }
    yield {
      line: 5,
      message: `Insere ${u} em F e remove suas arestas de saída (decrementa o grau de entrada dos vizinhos). F = [${F.join(', ')}].`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      structures: [indegStruct(), fStruct()],
    }
  }

  yield {
    line: 6,
    done: true,
    message: `Ordenação topológica concluída: ${F.join(' → ')}.`,
    nodeStates: Object.fromEntries(ids.map((id) => [id, 'done'])),
    edgeStates: { ...edgeStates },
    structures: [fStruct()],
    order: F,
  }
}
