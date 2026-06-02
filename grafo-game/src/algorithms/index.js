import * as bfs from './bfs'
import * as dfs from './dfs'
import * as dijkstra from './dijkstra'
import * as prim from './prim'
import * as kruskal from './kruskal'
import * as topologicalSort from './topologicalSort'
import * as kosaraju from './kosaraju'
import * as floydWarshall from './floydWarshall'
import { collect } from './helpers'

// Registry of graph algorithms available in Arena and Lab modes.
// requires:  'directed' | 'undirected' | 'any'
// needsStart: whether the player must pick an origin vertex.
export const ALGORITHMS = {
  dijkstra: {
    key: 'dijkstra',
    name: 'Dijkstra',
    short: 'Caminhos mínimos com pesos ≥ 0',
    requires: 'any',
    needsStart: true,
    concept: 'dijkstra',
    pseudocode: dijkstra.pseudocode,
    run: dijkstra.run,
  },
  bfs: {
    key: 'bfs',
    name: 'BFS — Busca em Largura',
    short: 'Caminho mínimo em nº de arestas',
    requires: 'any',
    needsStart: true,
    concept: 'bfs',
    pseudocode: bfs.pseudocode,
    run: bfs.run,
  },
  dfs: {
    key: 'dfs',
    name: 'DFS — Classificação de Arestas',
    short: 'Árvore/retorno/avanço/cruzamento, tempos',
    requires: 'any',
    needsStart: true,
    concept: 'dfs',
    pseudocode: dfs.pseudocode,
    run: dfs.run,
  },
  kosaraju: {
    key: 'kosaraju',
    name: 'Kosaraju — Comp. Fortemente Conexas',
    short: 'Duas DFS + grafo transposto',
    requires: 'directed',
    needsStart: false,
    concept: 'kosaraju',
    pseudocode: kosaraju.pseudocode,
    run: kosaraju.run,
  },
  topologicalSort: {
    key: 'topologicalSort',
    name: 'Ordenação Topológica',
    short: 'Algoritmo da fonte (grau de entrada 0)',
    requires: 'directed',
    needsStart: false,
    concept: 'topologicalSort',
    pseudocode: topologicalSort.pseudocode,
    run: topologicalSort.run,
  },
  kruskal: {
    key: 'kruskal',
    name: 'Kruskal — AGM',
    short: 'Ordena arestas + union-find',
    requires: 'undirected',
    needsStart: false,
    concept: 'kruskal',
    pseudocode: kruskal.pseudocode,
    run: kruskal.run,
  },
  prim: {
    key: 'prim',
    name: 'Prim — AGM',
    short: 'Fila de prioridade + cortes',
    requires: 'undirected',
    needsStart: true,
    concept: 'prim',
    pseudocode: prim.pseudocode,
    run: prim.run,
  },
  floydWarshall: {
    key: 'floydWarshall',
    name: 'Floyd-Warshall',
    short: 'Todos os pares (Θ(V³))',
    requires: 'any',
    needsStart: false,
    concept: 'floydWarshall',
    pseudocode: floydWarshall.pseudocode,
    run: floydWarshall.run,
  },
}

export const ALGO_LIST = Object.values(ALGORITHMS)

// Materialise an algorithm into an array of steps for stepping forward/back.
export function runAlgorithm(key, graph, startId) {
  const algo = ALGORITHMS[key]
  if (!algo) return []
  try {
    return collect(algo.run(graph, startId))
  } catch (err) {
    console.error('Algorithm error', key, err)
    return [
      {
        line: 0,
        message: `Erro ao executar: ${err.message}`,
        nodeStates: {},
        edgeStates: {},
        structures: [],
        done: true,
      },
    ]
  }
}
