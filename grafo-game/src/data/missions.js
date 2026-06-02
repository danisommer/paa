import {
  mstGraph,
  sccGraph,
  factoryGraph,
  dagGraph,
  gasGraph,
  activities,
  huffmanFreqs,
  cloneGraph,
} from './exampleGraphs'

// ── Pure graph helpers used by the validators ───────────────────────────────
function adj(graph) {
  const m = {}
  graph.nodes.forEach((n) => (m[n.id] = []))
  graph.edges.forEach((e) => {
    const w = e.weight ?? 1
    m[e.source].push({ to: e.target, w })
    if (!graph.directed) m[e.target].push({ to: e.source, w })
  })
  return m
}

function edgeWeight(graph, u, v) {
  for (const e of graph.edges) {
    if (
      (e.source === u && e.target === v) ||
      (!graph.directed && e.source === v && e.target === u)
    )
      return e.weight ?? 1
  }
  return null
}

export function dijkstraDist(graph, start) {
  const a = adj(graph)
  const dist = {}
  graph.nodes.forEach((n) => (dist[n.id] = Infinity))
  dist[start] = 0
  const seen = new Set()
  while (seen.size < graph.nodes.length) {
    let u = null
    let best = Infinity
    for (const n of graph.nodes)
      if (!seen.has(n.id) && dist[n.id] < best) {
        best = dist[n.id]
        u = n.id
      }
    if (u === null) break
    seen.add(u)
    for (const { to, w } of a[u]) if (dist[u] + w < dist[to]) dist[to] = dist[u] + w
  }
  return dist
}

export function bfsDist(graph, start) {
  const a = adj(graph)
  const dist = {}
  graph.nodes.forEach((n) => (dist[n.id] = Infinity))
  dist[start] = 0
  const q = [start]
  while (q.length) {
    const u = q.shift()
    for (const { to } of a[u])
      if (dist[to] === Infinity) {
        dist[to] = dist[u] + 1
        q.push(to)
      }
  }
  return dist
}

function mstWeight(graph) {
  const edges = graph.edges
    .map((e) => ({ u: e.source, v: e.target, w: e.weight ?? 1 }))
    .sort((a, b) => a.w - b.w)
  const parent = {}
  graph.nodes.forEach((n) => (parent[n.id] = n.id))
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  let total = 0
  let count = 0
  for (const e of edges) {
    if (find(e.u) !== find(e.v)) {
      parent[find(e.u)] = find(e.v)
      total += e.w
      count++
    }
  }
  return count === graph.nodes.length - 1 ? total : Infinity
}

function dfsTreeEdges(graph, root) {
  const a = adj(graph)
  Object.values(a).forEach((l) => l.sort((x, y) => (x.to < y.to ? -1 : 1)))
  const color = {}
  graph.nodes.forEach((n) => (color[n.id] = 'w'))
  const tree = new Set()
  const order = [root, ...graph.nodes.map((n) => n.id).filter((id) => id !== root)]
  const visit = (u) => {
    color[u] = 'g'
    for (const { to } of a[u])
      if (color[to] === 'w') {
        tree.add(`${u}->${to}`)
        visit(to)
      }
    color[u] = 'b'
  }
  for (const u of order) if (color[u] === 'w') visit(u)
  return tree
}

// Expected SCC partition for the prova graph.
const SCC_EXPECTED = [
  ['a', 'b', 'f', 'g'],
  ['c', 'e', 'h'],
  ['d'],
]

function samePartition(groupsObj, expected) {
  // groupsObj: { nodeId: groupKey }. Build sets keyed by groupKey.
  const byGroup = {}
  for (const [id, gk] of Object.entries(groupsObj)) {
    if (gk == null) return false // every node must be assigned
    ;(byGroup[gk] = byGroup[gk] || []).push(id)
  }
  const got = Object.values(byGroup)
    .map((s) => s.slice().sort().join(','))
    .sort()
  const exp = expected.map((s) => s.slice().sort().join(',')).sort()
  return got.length === exp.length && got.every((s, i) => s === exp[i])
}

// ── Mission definitions ─────────────────────────────────────────────────────
// kind drives which interaction widget MissionsMode renders.

export const MISSIONS = [
  {
    id: 'm1',
    num: 1,
    category: 'grafos',
    concept: 'dijkstra',
    kind: 'path',
    title: 'O caminho do robô',
    story:
      'O robô precisa levar matéria-prima do Armazém até o Equipamento 5 (E5) pelo caminho de menor custo total. Clique nos vértices, em sequência, para traçar o caminho.',
    graph: cloneGraph(factoryGraph),
    start: 'Arm',
    target: 'E5',
    hint: 'Pesos menores nem sempre formam o menor caminho total — some os custos.',
    validate({ pathNodes }) {
      return validatePath(this.graph, this.start, this.target, pathNodes, 'peso')
    },
  },
  {
    id: 'm2',
    num: 2,
    category: 'grafos',
    concept: 'bfs',
    kind: 'path',
    metric: 'bfs',
    title: 'Menos conexões possível',
    story:
      'Sinal de controle deve ir de C até F passando pelo MENOR número de dutos (arestas), ignorando os custos. Clique nos vértices para traçar o caminho com menos arestas.',
    graph: cloneGraph(sccGraph),
    start: 'c',
    target: 'f',
    hint: 'Aqui o que importa é o número de arestas (BFS), não o peso.',
    validate({ pathNodes }) {
      return validatePath(this.graph, this.start, this.target, pathNodes, 'arestas')
    },
  },
  {
    id: 'm3',
    num: 3,
    category: 'grafos',
    concept: 'dfs',
    kind: 'edge-set',
    title: 'A árvore da profundidade',
    story:
      'Execute a DFS a partir de "a" (vizinhos em ordem alfabética) e clique em todas as arestas que pertencem à ÁRVORE de busca em profundidade.',
    graph: cloneGraph(sccGraph),
    root: 'a',
    hint: 'Aresta de árvore = quando você descobre um vértice BRANCO.',
    validate({ selectedEdges }) {
      const expected = dfsTreeEdges(this.graph, this.root)
      const got = new Set(selectedEdges)
      const ok =
        got.size === expected.size && [...expected].every((e) => got.has(e))
      return {
        ok,
        score: ok ? 100 : 0,
        message: ok
          ? `Correto! A árvore DFS tem ${expected.size} arestas.`
          : `As arestas de árvore corretas estão destacadas. Esperado: ${[...expected].join(', ')}.`,
        expectedEdges: [...expected],
      }
    },
  },
  {
    id: 'm4',
    num: 4,
    category: 'grafos',
    concept: 'topologicalSort',
    kind: 'topo-order',
    title: 'Ordem da linha de produção',
    story:
      'Esta linha de produção é um DAG. Clique nos vértices na ordem de uma ordenação topológica válida (toda tarefa antes das que dependem dela).',
    graph: cloneGraph(dagGraph),
    hint: 'Comece por um vértice com grau de entrada 0 (sem dependências).',
    validate({ order }) {
      const ids = this.graph.nodes.map((n) => n.id)
      if (order.length !== ids.length)
        return { ok: false, score: 0, message: 'Selecione todos os vértices.' }
      const pos = {}
      order.forEach((id, i) => (pos[id] = i))
      for (const e of this.graph.edges) {
        if (pos[e.source] > pos[e.target])
          return {
            ok: false,
            score: 0,
            message: `Violação: ${e.source}→${e.target}, mas ${e.target} apareceu antes de ${e.source}.`,
          }
      }
      return { ok: true, score: 100, message: `Ordenação topológica válida: ${order.join(' → ')}.` }
    },
  },
  {
    id: 'm5',
    num: 5,
    category: 'gulosos',
    concept: null,
    kind: 'maxflow',
    title: 'Pico de demanda de gás',
    story:
      'Distribua o fluxo de gás de S até T sem exceder a capacidade de cada duto. Use + / − em cada aresta. Maximize o fluxo total que chega em T (respeitando a conservação em A e B).',
    graph: cloneGraph(gasGraph),
    optimal: 11,
    hint: 'Fluxo que entra = fluxo que sai em cada nó interno. O máximo é limitado pelo corte mínimo.',
    validate({ flows }) {
      const g = this.graph
      // capacity check
      for (const e of g.edges) {
        const f = flows[`${e.source}->${e.target}`] || 0
        if (f < 0) return { ok: false, score: 0, message: 'Fluxo não pode ser negativo.' }
        if (f > (e.weight ?? 0))
          return {
            ok: false,
            score: 0,
            message: `Capacidade excedida em ${e.source}→${e.target} (${f} > ${e.weight}).`,
          }
      }
      const inflow = (node) =>
        g.edges
          .filter((e) => e.target === node)
          .reduce((s, e) => s + (flows[`${e.source}->${e.target}`] || 0), 0)
      const outflow = (node) =>
        g.edges
          .filter((e) => e.source === node)
          .reduce((s, e) => s + (flows[`${e.source}->${e.target}`] || 0), 0)
      for (const node of ['A', 'B']) {
        if (inflow(node) !== outflow(node))
          return {
            ok: false,
            score: 0,
            message: `Conservação violada em ${node}: entra ${inflow(node)}, sai ${outflow(node)}.`,
          }
      }
      const value = outflow('S')
      if (value !== inflow('T'))
        return { ok: false, score: 0, message: 'Fluxo que sai de S deve chegar em T.' }
      if (value < this.optimal)
        return {
          ok: false,
          score: 40,
          message: `Fluxo válido = ${value}, mas não é o máximo. O fluxo máximo é ${this.optimal}.`,
        }
      return { ok: true, score: 100, message: `Fluxo máximo alcançado: ${value} m³/min!` }
    },
  },
  {
    id: 'm6',
    num: 6,
    category: 'gulosos',
    concept: 'activity',
    kind: 'activity',
    title: 'Agenda da fábrica',
    story:
      'Selecione o maior número de atividades compatíveis (que não se sobrepõem). Clique para selecionar/remover. Dica: pense no horário de TÉRMINO.',
    activities,
    optimal: 3, // a1, a4, a8
    hint: 'Escolha gulosamente a atividade que termina mais cedo e seja compatível.',
    validate({ selected }) {
      const chosen = activities
        .filter((a) => selected.includes(a.id))
        .sort((a, b) => a.finish - b.finish)
      for (let i = 1; i < chosen.length; i++) {
        if (chosen[i].start < chosen[i - 1].finish)
          return {
            ok: false,
            score: 0,
            message: `${chosen[i].id} (início ${chosen[i].start}) conflita com ${chosen[i - 1].id} (término ${chosen[i - 1].finish}).`,
          }
      }
      if (chosen.length < this.optimal)
        return {
          ok: false,
          score: 50,
          message: `Conjunto compatível, mas não é o maior. É possível selecionar ${this.optimal} atividades.`,
        }
      return { ok: true, score: 100, message: `Ótimo! ${chosen.length} atividades compatíveis.` }
    },
  },
  {
    id: 'm7',
    num: 7,
    category: 'gulosos',
    concept: 'huffman',
    kind: 'huffman',
    title: 'A árvore de Huffman',
    story:
      'Monte a árvore de Huffman combinando, a cada passo, os DOIS nós de menor frequência. Clique em dois nós para combiná-los.',
    freqs: huffmanFreqs,
    hint: 'Sempre os dois menores. O total combinado vira o peso do novo nó.',
    // merges: array of [wA, wB] weight pairs chosen, in order.
    validate({ merges }) {
      let multiset = huffmanFreqs.map((f) => f.freq)
      for (const [wa, wb] of merges) {
        const sorted = [...multiset].sort((p, q) => p - q)
        const twoMin = [sorted[0], sorted[1]].sort((p, q) => p - q)
        const picked = [wa, wb].sort((p, q) => p - q)
        if (picked[0] !== twoMin[0] || picked[1] !== twoMin[1])
          return {
            ok: false,
            score: 0,
            message: `Você combinou ${wa}+${wb}, mas os dois menores eram ${twoMin[0]} e ${twoMin[1]}.`,
          }
        multiset.splice(multiset.indexOf(wa), 1)
        multiset.splice(multiset.indexOf(wb), 1)
        multiset.push(wa + wb)
      }
      if (multiset.length !== 1)
        return { ok: false, score: 30, message: 'Continue combinando até sobrar um único nó (a raiz).' }
      return { ok: true, score: 100, message: `Árvore de Huffman ótima construída! Raiz com peso ${multiset[0]}.` }
    },
  },
  {
    id: 'm8',
    num: 8,
    category: 'gulosos',
    concept: 'kruskal',
    kind: 'mst-edges',
    title: 'Esteiras com custo mínimo',
    story:
      'Conecte TODOS os equipamentos com o menor custo total de esteiras (Árvore Geradora Mínima). Clique nas arestas para incluí-las/removê-las.',
    graph: cloneGraph(mstGraph),
    hint: 'Kruskal: ordene por peso e evite ciclos. A AGM tem V−1 arestas.',
    validate({ selectedEdges }) {
      return validateMST(this.graph, selectedEdges)
    },
  },
  {
    id: 'm9',
    num: 9,
    category: 'grafos',
    concept: 'kosaraju',
    kind: 'scc-group',
    title: 'Ilhas fortemente conexas',
    story:
      'Agrupe os vértices nas Componentes Fortemente Conexas corretas. Clique em um vértice para trocar sua cor/grupo até formar as CFCs.',
    graph: cloneGraph(sccGraph),
    groupCount: 3,
    hint: 'u e v estão na mesma CFC se há caminho de u para v E de v para u.',
    validate({ groups }) {
      const ok = samePartition(groups, SCC_EXPECTED)
      return {
        ok,
        score: ok ? 100 : 0,
        message: ok
          ? 'Correto! As CFCs são {a,b,f,g}, {c,e,h} e {d}.'
          : 'Ainda não. Reveja quais vértices conseguem se alcançar mutuamente.',
        expected: SCC_EXPECTED,
      }
    },
  },
  {
    id: 'm10',
    num: 10,
    category: 'grafos',
    concept: 'dijkstra',
    kind: 'path',
    title: 'Entrega expressa A → G',
    story:
      'Trace o caminho mínimo (menor custo total) de A até G no grafo de distribuição. Clique nos vértices em sequência.',
    graph: cloneGraph(mstGraph),
    start: 'A',
    target: 'G',
    hint: 'A→B→G custa 2+8=10. Existe algo melhor? Compare com Dijkstra.',
    validate({ pathNodes }) {
      return validatePath(this.graph, this.start, this.target, pathNodes, 'peso')
    },
  },
  {
    id: 'm11',
    num: 11,
    category: 'grafos',
    concept: 'dfs',
    kind: 'cycle',
    title: 'Caça ao ciclo',
    story:
      'Este grafo direcionado tem ciclos. Clique nas arestas, em sequência, que formam UM ciclo direcionado fechado.',
    graph: cloneGraph(sccGraph),
    hint: 'Um ciclo direcionado volta ao ponto de partida seguindo o sentido das setas.',
    validate({ selectedDirEdges }) {
      return validateCycle(this.graph, selectedDirEdges)
    },
  },
  {
    id: 'm12',
    num: 12,
    category: 'grafos',
    concept: 'floydWarshall',
    kind: 'path',
    title: 'Boss: rota ótima na fábrica',
    story:
      'Desafio final: trace o caminho de menor custo entre E2 e E5 — a mesma distância que Floyd-Warshall calcularia para esse par.',
    graph: cloneGraph(factoryGraph),
    start: 'E2',
    target: 'E5',
    hint: 'Floyd-Warshall acharia todas as distâncias; aqui só precisamos de E2→E5.',
    validate({ pathNodes }) {
      return validatePath(this.graph, this.start, this.target, pathNodes, 'peso')
    },
  },
]

// ── Shared validators referenced above ──────────────────────────────────────
export function validatePath(graph, start, target, pathNodes, metric) {
  if (!pathNodes || pathNodes.length < 2)
    return { ok: false, score: 0, message: 'Trace um caminho clicando em pelo menos 2 vértices.' }
  if (pathNodes[0] !== start)
    return { ok: false, score: 0, message: `O caminho deve começar em ${start}.` }
  if (pathNodes[pathNodes.length - 1] !== target)
    return { ok: false, score: 0, message: `O caminho deve terminar em ${target}.` }
  let total = 0
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const w = edgeWeight(graph, pathNodes[i], pathNodes[i + 1])
    if (w === null)
      return {
        ok: false,
        score: 0,
        message: `Não existe aresta entre ${pathNodes[i]} e ${pathNodes[i + 1]}.`,
      }
    total += metric === 'arestas' ? 1 : w
  }
  const opt =
    metric === 'arestas' ? bfsDist(graph, start)[target] : dijkstraDist(graph, start)[target]
  const ok = total === opt
  const unit = metric === 'arestas' ? 'aresta(s)' : 'de custo'
  return {
    ok,
    score: ok ? 100 : total < opt ? 0 : 60,
    message: ok
      ? `Caminho mínimo! ${total} ${unit}.`
      : `Caminho válido custa ${total} ${unit}, mas o mínimo é ${opt}. Tente de novo.`,
    optimal: opt,
  }
}

export function validateMST(graph, selectedEdges) {
  const ids = graph.nodes.map((n) => n.id)
  const sel = graph.edges.filter((e) => selectedEdges.includes(edgeKeyOf(e)))
  // union-find to test acyclic + connected
  const parent = {}
  ids.forEach((id) => (parent[id] = id))
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  let total = 0
  for (const e of sel) {
    if (find(e.source) === find(e.target))
      return { ok: false, score: 0, message: 'As arestas escolhidas formam um CICLO — uma árvore não tem ciclos.' }
    parent[find(e.source)] = find(e.target)
    total += e.weight ?? 1
  }
  const roots = new Set(ids.map((id) => find(id)))
  if (roots.size > 1)
    return { ok: false, score: 0, message: 'O grafo ainda não está totalmente conectado.' }
  if (sel.length !== ids.length - 1)
    return { ok: false, score: 0, message: `Uma AGM tem ${ids.length - 1} arestas; você escolheu ${sel.length}.` }
  const best = mstWeight(graph)
  const ok = total === best
  return {
    ok,
    score: ok ? 100 : 60,
    message: ok
      ? `Árvore Geradora Mínima perfeita! Custo total = ${total}.`
      : `É uma árvore geradora (custo ${total}), mas não a mínima (mínimo = ${best}).`,
    optimal: best,
  }
}

export function validateCycle(graph, dirEdges) {
  if (!dirEdges || dirEdges.length < 2)
    return { ok: false, score: 0, message: 'Selecione as arestas de um ciclo.' }
  // each selected directed edge must exist; they must form a single closed cycle
  for (const [u, v] of dirEdges) {
    if (!graph.edges.some((e) => e.source === u && e.target === v))
      return { ok: false, score: 0, message: `A aresta ${u}→${v} não existe (verifique o sentido).` }
  }
  const start = dirEdges[0][0]
  let cur = start
  const used = new Set()
  for (let step = 0; step < dirEdges.length; step++) {
    // follow an unused edge whose source is the current vertex
    const idx = dirEdges.findIndex(([u], i) => u === cur && !used.has(i))
    if (idx === -1)
      return { ok: false, score: 0, message: 'As arestas não se encadeiam em um caminho contínuo.' }
    used.add(idx)
    cur = dirEdges[idx][1]
  }
  const ok = cur === start && used.size === dirEdges.length
  return {
    ok,
    score: ok ? 100 : 0,
    message: ok
      ? 'Ciclo direcionado válido encontrado! 🎉'
      : 'As arestas não voltam ao ponto de partida formando um ciclo.',
  }
}

export function edgeKeyOf(e) {
  return `${e.source}|${e.target}`
}

export function missionById(id) {
  return MISSIONS.find((m) => m.id === id)
}

export const TOTAL_GRAFOS = MISSIONS.filter((m) => m.category === 'grafos').length
export const TOTAL_GULOSOS = MISSIONS.filter((m) => m.category === 'gulosos').length
