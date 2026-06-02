// Block puzzles for the Arena. Each algorithm offers a pool of pseudocode
// blocks (correct, wrong, inefficient) and a canonical `solution` ordering of
// the efficient correct blocks. An inefficient block declares `equivalent`:
// the correct block it can stand in for (still works, but costs points).

import { mstGraph, sccGraph, dagGraph } from './exampleGraphs'

export const ARENA = {
  dijkstra: {
    algoKey: 'dijkstra',
    graphId: 'mst',
    graph: mstGraph,
    start: 'A',
    blocks: [
      { id: 'd-init', text: 'Inicializar dist[v] = ∞ para todo v, e dist[s] = 0', kind: 'correct' },
      { id: 'd-pq', text: 'Inserir todos os vértices em uma fila de prioridade (min-heap)', kind: 'correct' },
      { id: 'd-loop', text: 'Enquanto a fila de prioridade não estiver vazia', kind: 'correct' },
      { id: 'd-extract', text: 'u ← extrair-mínimo (vértice de menor dist) e finalizá-lo', kind: 'correct' },
      { id: 'd-neighbors', text: 'Para cada vizinho v de u', kind: 'correct' },
      { id: 'd-relax', text: 'Relaxar (u,v): se dist[u]+w(u,v) < dist[v], atualizar dist[v] e π[v]', kind: 'correct' },
      { id: 'd-relax-noinit', text: 'Relaxar arestas direto, sem inicializar as distâncias', kind: 'wrong' },
      { id: 'd-max', text: 'u ← extrair o vértice de MAIOR dist da fila', kind: 'wrong' },
      { id: 'd-neg', text: 'Tratar pesos negativos relaxando vértices já finalizados', kind: 'wrong' },
      { id: 'd-linear', text: 'Encontrar o menor dist por busca linear no vetor O(V)', kind: 'inefficient', equivalent: 'd-extract' },
    ],
    solution: ['d-init', 'd-pq', 'd-loop', 'd-extract', 'd-neighbors', 'd-relax'],
  },

  bfs: {
    algoKey: 'bfs',
    graphId: 'mst',
    graph: mstGraph,
    start: 'A',
    blocks: [
      { id: 'b-init', text: 'Inicializar cor[v] = branco, d[v] = ∞ para todo v', kind: 'correct' },
      { id: 'b-start', text: 'cor[s] = cinza, d[s] = 0, enfileirar(s)', kind: 'correct' },
      { id: 'b-loop', text: 'Enquanto a fila não estiver vazia', kind: 'correct' },
      { id: 'b-deq', text: 'u ← desenfileirar (FIFO)', kind: 'correct' },
      { id: 'b-neighbors', text: 'Para cada vizinho v de u', kind: 'correct' },
      { id: 'b-white', text: 'Se v é branco: pintar de cinza, d[v]=d[u]+1, π[v]=u, enfileirar(v)', kind: 'correct' },
      { id: 'b-black', text: 'Ao terminar u: cor[u] = preto', kind: 'correct' },
      { id: 'b-stack', text: 'u ← desempilhar (LIFO / pilha)', kind: 'wrong' },
      { id: 'b-weight', text: 'd[v] = d[u] + w(u,v) usando o peso da aresta', kind: 'wrong' },
      { id: 'b-revisit', text: 'Enfileirar v mesmo se já estiver cinza/preto', kind: 'wrong' },
    ],
    solution: ['b-init', 'b-start', 'b-loop', 'b-deq', 'b-neighbors', 'b-white', 'b-black'],
  },

  dfs: {
    algoKey: 'dfs',
    graphId: 'scc',
    graph: sccGraph,
    start: 'a',
    blocks: [
      { id: 'f-init', text: 'Inicializar cor[v] = branco para todo v; tempo = 0', kind: 'correct' },
      { id: 'f-disc', text: 'Ao descobrir u: tempo++, d[u] = tempo, cor[u] = cinza', kind: 'correct' },
      { id: 'f-neighbors', text: 'Para cada vizinho v de u (ordem alfabética)', kind: 'correct' },
      { id: 'f-tree', text: 'Se v é branco: aresta de ÁRVORE e visitar v recursivamente', kind: 'correct' },
      { id: 'f-back', text: 'Senão, se v é cinza: aresta de RETORNO', kind: 'correct' },
      { id: 'f-fwdcross', text: 'Senão (v preto): AVANÇO se d[u]<d[v], senão CRUZAMENTO', kind: 'correct' },
      { id: 'f-finish', text: 'Ao terminar u: tempo++, f[u] = tempo, cor[u] = preto', kind: 'correct' },
      { id: 'f-queue', text: 'Usar uma fila (FIFO) para visitar os vértices', kind: 'wrong' },
      { id: 'f-graytree', text: 'Tratar aresta para vértice cinza como aresta de árvore', kind: 'wrong' },
      { id: 'f-matrix', text: 'Encontrar vizinhos varrendo a matriz de adjacência O(V) por vértice', kind: 'inefficient', equivalent: 'f-neighbors' },
    ],
    solution: ['f-init', 'f-disc', 'f-neighbors', 'f-tree', 'f-back', 'f-fwdcross', 'f-finish'],
  },

  kruskal: {
    algoKey: 'kruskal',
    graphId: 'mst',
    graph: mstGraph,
    blocks: [
      { id: 'k-init', text: 'A ← ∅; criar um conjunto disjunto para cada vértice (make-set)', kind: 'correct' },
      { id: 'k-sort', text: 'Ordenar as arestas por peso CRESCENTE', kind: 'correct' },
      { id: 'k-loop', text: 'Para cada aresta (u,v) na ordem crescente', kind: 'correct' },
      { id: 'k-check', text: 'Se find(u) ≠ find(v): adicionar à AGM e union(u,v)', kind: 'correct' },
      { id: 'k-desc', text: 'Ordenar as arestas por peso DECRESCENTE', kind: 'wrong' },
      { id: 'k-nocheck', text: 'Adicionar toda aresta à AGM sem checar ciclo', kind: 'wrong' },
      { id: 'k-cyclebfs', text: 'Detectar ciclo com uma BFS/DFS a cada aresta O(V+E)', kind: 'inefficient', equivalent: 'k-check' },
    ],
    solution: ['k-init', 'k-sort', 'k-loop', 'k-check'],
  },

  prim: {
    algoKey: 'prim',
    graphId: 'mst',
    graph: mstGraph,
    start: 'A',
    blocks: [
      { id: 'p-init', text: 'key[v] = ∞ para todo v; key[r] = 0; π[v] = nil', kind: 'correct' },
      { id: 'p-pq', text: 'Inserir todos os vértices em uma fila de prioridade pela key', kind: 'correct' },
      { id: 'p-loop', text: 'Enquanto a fila não estiver vazia', kind: 'correct' },
      { id: 'p-extract', text: 'u ← extrair-mínimo (aresta leve que cruza o corte)', kind: 'correct' },
      { id: 'p-update', text: 'Para v adjacente a u fora da árvore: se w(u,v) < key[v], atualizar key[v] e π[v]', kind: 'correct' },
      { id: 'p-dist', text: 'Atualizar key[v] = dist[u] + w(u,v) (somando o caminho)', kind: 'wrong' },
      { id: 'p-max', text: 'u ← extrair o vértice de MAIOR key', kind: 'wrong' },
      { id: 'p-linear', text: 'Encontrar a menor key por busca linear O(V)', kind: 'inefficient', equivalent: 'p-extract' },
    ],
    solution: ['p-init', 'p-pq', 'p-loop', 'p-extract', 'p-update'],
  },

  kosaraju: {
    algoKey: 'kosaraju',
    graphId: 'scc',
    graph: sccGraph,
    blocks: [
      { id: 'ko-dfs1', text: '1ª DFS em G: registrar a ordem de FECHAMENTO em uma pilha', kind: 'correct' },
      { id: 'ko-transpose', text: 'Construir o grafo transposto Gᵀ (inverter todas as arestas)', kind: 'correct' },
      { id: 'ko-dfs2', text: '2ª DFS em Gᵀ, na ordem DECRESCENTE de fechamento', kind: 'correct' },
      { id: 'ko-collect', text: 'Cada árvore da 2ª DFS é uma componente fortemente conexa', kind: 'correct' },
      { id: 'ko-same', text: 'Fazer a 2ª DFS no mesmo grafo G (sem transpor)', kind: 'wrong' },
      { id: 'ko-cresc', text: 'Processar a 2ª DFS na ordem CRESCENTE de fechamento', kind: 'wrong' },
      { id: 'ko-one', text: 'Uma única DFS já encontra as componentes', kind: 'wrong' },
    ],
    solution: ['ko-dfs1', 'ko-transpose', 'ko-dfs2', 'ko-collect'],
  },

  topologicalSort: {
    algoKey: 'topologicalSort',
    graphId: 'dag',
    graph: dagGraph,
    blocks: [
      { id: 't-indeg', text: 'Calcular o grau de entrada de todos os vértices', kind: 'correct' },
      { id: 't-find', text: 'Encontrar um vértice-fonte (grau de entrada 0)', kind: 'correct' },
      { id: 't-insert', text: 'Inserir a fonte no fim da lista F', kind: 'correct' },
      { id: 't-remove', text: 'Remover as arestas de saída da fonte (decrementar grau de entrada dos vizinhos)', kind: 'correct' },
      { id: 't-repeat', text: 'Repetir enquanto existir vértice-fonte', kind: 'correct' },
      { id: 't-outdeg', text: 'Procurar vértice com grau de SAÍDA 0', kind: 'wrong' },
      { id: 't-noremove', text: 'Inserir todos os vértices em F sem remover arestas', kind: 'wrong' },
      { id: 't-rescan', text: 'Recalcular todos os graus de entrada do zero a cada iteração', kind: 'inefficient', equivalent: 't-remove' },
    ],
    solution: ['t-indeg', 't-find', 't-insert', 't-remove', 't-repeat'],
  },
}

export const ARENA_LIST = Object.values(ARENA)

// Validate a chosen program (array of block objects) against the solution.
export function evaluateProgram(entry, program) {
  const solution = entry.solution
  const logical = program.map((b) => (b.kind === 'inefficient' ? b.equivalent : b.id))
  const hasWrong = program.some((b) => b.kind === 'wrong')
  const usedInefficient = program.some((b) => b.kind === 'inefficient')

  // find first divergence for error highlight
  let errorIndex = -1
  for (let i = 0; i < Math.max(logical.length, solution.length); i++) {
    if (logical[i] !== solution[i]) {
      errorIndex = i
      break
    }
  }

  const exactCorrect = !hasWrong && logical.length === solution.length && errorIndex === -1

  if (exactCorrect && !usedInefficient) {
    return { score: 100, status: 'correct', errorIndex: -1, message: 'Algoritmo correto e eficiente! 100 pontos.' }
  }
  if (exactCorrect && usedInefficient) {
    return {
      score: 60,
      status: 'inefficient',
      errorIndex: -1,
      message: 'O algoritmo funciona, mas há um bloco INEFICIENTE (⚠). 60 pontos.',
    }
  }
  // wrong
  let message = 'Algoritmo incorreto. '
  if (hasWrong) message += 'Há um bloco logicamente errado no programa.'
  else if (logical.length < solution.length) message += 'Faltam passos.'
  else if (logical.length > solution.length) message += 'Há passos a mais.'
  else message += 'A ordem dos passos está errada.'
  return { score: 0, status: 'wrong', errorIndex: errorIndex < 0 ? program.length - 1 : errorIndex, message }
}
