// Huffman coding. Unlike the others this operates on a frequency table, not a
// graph, so it is consumed by the Huffman mission (drag symbols) and by a
// "show solution" stepper.

export const pseudocode = [
  'cria uma folha para cada símbolo (peso = frequência)',
  'insere todas as folhas em uma fila de prioridade (mín)',
  'enquanto houver mais de um nó na fila:',
  '  x ← extrair-mínimo ; y ← extrair-mínimo',
  '  cria nó z com peso = peso(x)+peso(y), filhos x e y',
  '  insere z na fila',
  'o nó restante é a raiz da árvore de Huffman',
]

let _id = 0
function leaf(symbol, freq) {
  return { id: `n${_id++}`, symbol, freq, left: null, right: null }
}
function merge(a, b) {
  return { id: `n${_id++}`, symbol: null, freq: a.freq + b.freq, left: a, right: b }
}

// Build the tree, returning { root, codes }.
export function buildHuffman(freqs) {
  _id = 0
  let nodes = freqs.map((f) => leaf(f.symbol, f.freq))
  while (nodes.length > 1) {
    nodes.sort((a, b) => (a.freq - b.freq) || ((a.symbol || 'z') > (b.symbol || 'z') ? 1 : -1))
    const x = nodes.shift()
    const y = nodes.shift()
    nodes.push(merge(x, y))
  }
  const root = nodes[0]
  const codes = {}
  const walk = (node, prefix) => {
    if (!node) return
    if (node.symbol != null) {
      codes[node.symbol] = prefix || '0'
      return
    }
    walk(node.left, prefix + '0')
    walk(node.right, prefix + '1')
  }
  if (root) walk(root, '')
  return { root, codes }
}

// Step generator for the "show solution" animation of the merge process.
export function* run(freqs) {
  _id = 0
  let nodes = freqs.map((f) => leaf(f.symbol, f.freq))
  const queueStruct = () => ({
    type: 'pqueue',
    title: 'Fila de prioridade',
    items: [...nodes]
      .sort((a, b) => a.freq - b.freq)
      .map((n) => ({ label: n.symbol || `(${n.freq})`, key: n.freq })),
  })

  yield {
    line: 1,
    message: `Cada símbolo vira uma folha com peso igual à sua frequência.`,
    structures: [queueStruct()],
    forest: nodes.map((n) => ({ ...n })),
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => (a.freq - b.freq) || ((a.symbol || 'z') > (b.symbol || 'z') ? 1 : -1))
    const x = nodes.shift()
    const y = nodes.shift()
    const z = merge(x, y)
    nodes.push(z)
    yield {
      line: 4,
      message: `Combina os dois menores: ${x.symbol || x.freq} (${x.freq}) e ${y.symbol || y.freq} (${y.freq}) ⟹ novo nó peso ${z.freq}.`,
      structures: [queueStruct()],
      forest: nodes.map((n) => ({ ...n })),
    }
  }

  const { codes } = buildHuffman(freqs)
  yield {
    line: 6,
    done: true,
    message: `Árvore de Huffman completa. Códigos: ${Object.entries(codes)
      .map(([s, c]) => `${s}=${c}`)
      .join(', ')}.`,
    structures: [{ type: 'codes', title: 'Códigos ótimos', codes }],
    root: nodes[0],
    codes,
  }
}
