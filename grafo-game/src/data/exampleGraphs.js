// Example graphs — reconstructed faithfully from the prova / lista de exercícios.
// Coordinate space is roughly 900 x 560 (the GraphCanvas viewBox).

export function cloneGraph(g) {
  return {
    ...g,
    nodes: g.nodes.map((n) => ({ ...n })),
    edges: g.edges.map((e) => ({ ...e })),
  }
}

// ── Exercício 44 / 47 da lista: Dijkstra, Prim e Kruskal ────────────────────
// Grafo não-direcionado e ponderado, vértices A–G.
export const mstGraph = {
  id: 'mst',
  name: 'Grafo de Dijkstra / Prim / Kruskal (lista, ex. 44 e 47)',
  directed: false,
  weighted: true,
  nodes: [
    { id: 'A', x: 300, y: 80 },
    { id: 'B', x: 620, y: 80 },
    { id: 'C', x: 150, y: 280 },
    { id: 'D', x: 460, y: 280 },
    { id: 'E', x: 770, y: 280 },
    { id: 'F', x: 300, y: 480 },
    { id: 'G', x: 620, y: 480 },
  ],
  edges: [
    { source: 'A', target: 'B', weight: 2 },
    { source: 'A', target: 'C', weight: 4 },
    { source: 'A', target: 'D', weight: 7 },
    { source: 'A', target: 'F', weight: 5 },
    { source: 'B', target: 'D', weight: 6 },
    { source: 'B', target: 'E', weight: 3 },
    { source: 'B', target: 'G', weight: 8 },
    { source: 'C', target: 'F', weight: 6 },
    { source: 'D', target: 'F', weight: 1 },
    { source: 'D', target: 'G', weight: 6 },
    { source: 'E', target: 'G', weight: 7 },
    { source: 'F', target: 'G', weight: 6 },
  ],
}

// ── Exercício 1 da prova: Componentes Fortemente Conexas (Kosaraju) ──────────
// Grafo direcionado, vértices a–h. SCCs: {a,b,f,g}, {c,e,h}, {d}.
export const sccGraph = {
  id: 'scc',
  name: 'Grafo de Componentes Fortemente Conexas (prova, questão 1)',
  directed: true,
  weighted: false,
  nodes: [
    { id: 'a', x: 110, y: 80 },
    { id: 'b', x: 330, y: 80 },
    { id: 'c', x: 650, y: 80 },
    { id: 'd', x: 470, y: 270 },
    { id: 'e', x: 820, y: 270 },
    { id: 'f', x: 110, y: 460 },
    { id: 'g', x: 330, y: 460 },
    { id: 'h', x: 650, y: 460 },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'g' },
    { source: 'f', target: 'a' },
    { source: 'f', target: 'b' },
    { source: 'd', target: 'b' },
    { source: 'd', target: 'g' },
    { source: 'g', target: 'f' },
    { source: 'c', target: 'd' },
    { source: 'c', target: 'e' },
    { source: 'e', target: 'h' },
    { source: 'h', target: 'c' },
    { source: 'h', target: 'd' },
  ],
}

// ── Exercício 2 da prova: layout da fábrica (Floyd-Warshall, todos os pares) ──
export const factoryGraph = {
  id: 'factory',
  name: 'Grafo da fábrica automatizada (prova, questão 2 — todos os pares)',
  directed: false,
  weighted: true,
  nodes: [
    { id: 'Arm', x: 90, y: 280 },
    { id: 'E1', x: 320, y: 130 },
    { id: 'E2', x: 320, y: 430 },
    { id: 'E3', x: 560, y: 130 },
    { id: 'E4', x: 560, y: 430 },
    { id: 'E5', x: 800, y: 280 },
  ],
  edges: [
    { source: 'Arm', target: 'E1', weight: 5 },
    { source: 'Arm', target: 'E2', weight: 6 },
    { source: 'E1', target: 'E2', weight: 2 },
    { source: 'E1', target: 'E3', weight: 8 },
    { source: 'E1', target: 'E4', weight: 2 },
    { source: 'E2', target: 'E4', weight: 8 },
    { source: 'E3', target: 'E4', weight: 2 },
    { source: 'E3', target: 'E5', weight: 9 },
    { source: 'E4', target: 'E5', weight: 4 },
  ],
}

// ── DAG da linha de produção (Ordenação topológica) ─────────────────────────
export const dagGraph = {
  id: 'dag',
  name: 'DAG da linha de produção (Ordenação Topológica)',
  directed: true,
  weighted: false,
  nodes: [
    { id: 'A', x: 100, y: 280 },
    { id: 'B', x: 320, y: 130 },
    { id: 'C', x: 320, y: 430 },
    { id: 'D', x: 540, y: 280 },
    { id: 'E', x: 560, y: 470 },
    { id: 'F', x: 790, y: 280 },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'C', target: 'E' },
    { source: 'D', target: 'F' },
    { source: 'E', target: 'F' },
  ],
}

// ── Rede de gás (Fluxo máximo — Ford-Fulkerson simplificado) ─────────────────
// Direcionado com capacidades. Fluxo máximo S→T = 11.
export const gasGraph = {
  id: 'gas',
  name: 'Rede de distribuição de gás (prova, questão 7 — fluxo máximo)',
  directed: true,
  weighted: true,
  nodes: [
    { id: 'S', x: 110, y: 280 },
    { id: 'A', x: 420, y: 120 },
    { id: 'B', x: 420, y: 440 },
    { id: 'T', x: 760, y: 280 },
  ],
  edges: [
    { source: 'S', target: 'A', weight: 6 },
    { source: 'S', target: 'B', weight: 6 },
    { source: 'A', target: 'B', weight: 2 },
    { source: 'A', target: 'T', weight: 5 },
    { source: 'B', target: 'T', weight: 6 },
  ],
}

export const EXAMPLE_GRAPHS = [mstGraph, sccGraph, factoryGraph, dagGraph, gasGraph]

export function emptyGraph() {
  return {
    id: 'custom',
    name: 'Meu grafo',
    directed: false,
    weighted: true,
    nodes: [],
    edges: [],
  }
}

// ── Dados não-grafo usados pelas missões gulosas ────────────────────────────

// Seleção de atividades (lista, ex. 36) — escolha gulosa por término.
export const activities = [
  { id: 'a1', start: 1, finish: 4 },
  { id: 'a2', start: 3, finish: 5 },
  { id: 'a3', start: 0, finish: 6 },
  { id: 'a4', start: 5, finish: 7 },
  { id: 'a5', start: 3, finish: 9 },
  { id: 'a6', start: 5, finish: 9 },
  { id: 'a7', start: 6, finish: 10 },
  { id: 'a8', start: 8, finish: 11 },
]
// Solução ótima gulosa (por término): a1, a4, a8.

// Huffman (lista, gulosos) — frequências clássicas.
export const huffmanFreqs = [
  { symbol: 'a', freq: 45 },
  { symbol: 'b', freq: 13 },
  { symbol: 'c', freq: 12 },
  { symbol: 'd', freq: 16 },
  { symbol: 'e', freq: 9 },
  { symbol: 'f', freq: 5 },
]
