import { useEffect, useMemo, useState } from 'react'
import {
  MousePointer2,
  Circle,
  Spline,
  Eraser,
  Trash2,
  Play,
  Pencil,
  Minus,
  Plus,
} from 'lucide-react'
import GraphCanvas from '../components/GraphCanvas'
import StepPanel from '../components/StepPanel'
import { useStepPlayer } from '../components/useStepPlayer'
import { ALGO_LIST, ALGORITHMS, runAlgorithm } from '../algorithms/index'
import { EXAMPLE_GRAPHS, emptyGraph, cloneGraph } from '../data/exampleGraphs'
import { useGameStore } from '../store/gameStore'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function nextLabel(graph) {
  const used = new Set(graph.nodes.map((n) => n.id))
  for (const ch of LETTERS) if (!used.has(ch)) return ch
  let i = 1
  while (used.has(`V${i}`)) i++
  return `V${i}`
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Selecionar / Mover' },
  { id: 'add', icon: Circle, label: 'Adicionar vértice' },
  { id: 'connect', icon: Spline, label: 'Conectar (aresta)' },
  { id: 'delete', icon: Eraser, label: 'Apagar' },
]

export default function LabMode() {
  const [graph, setGraph] = useState(() => cloneGraph(EXAMPLE_GRAPHS[0]))
  const [tool, setTool] = useState('select')
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdgeKey, setSelectedEdgeKey] = useState(null)
  const [linkingFrom, setLinkingFrom] = useState(null)
  const [algoKey, setAlgoKey] = useState('dijkstra')
  const [startId, setStartId] = useState('A')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const speed = useGameStore((s) => s.settings.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setActiveConceptAlgo = useGameStore((s) => s.setActiveConceptAlgo)

  const player = useStepPlayer(steps, speed)

  const availableAlgos = useMemo(
    () =>
      ALGO_LIST.filter(
        (a) =>
          a.requires === 'any' ||
          (a.requires === 'directed' && graph.directed) ||
          (a.requires === 'undirected' && !graph.directed),
      ),
    [graph.directed],
  )

  // keep algo valid when direction toggles
  useEffect(() => {
    if (!availableAlgos.find((a) => a.key === algoKey)) {
      setAlgoKey(availableAlgos[0]?.key || 'dijkstra')
    }
  }, [availableAlgos, algoKey])

  // keep start valid
  useEffect(() => {
    if (!graph.nodes.find((n) => n.id === startId)) {
      setStartId(graph.nodes[0]?.id || null)
    }
  }, [graph.nodes, startId])

  const algo = ALGORITHMS[algoKey]

  function invalidateRun() {
    if (running) {
      setRunning(false)
      setSteps([])
    }
  }

  function loadExample(id) {
    const g = id === 'custom' ? emptyGraph() : EXAMPLE_GRAPHS.find((x) => x.id === id)
    setGraph(cloneGraph(g))
    setRunning(false)
    setSteps([])
    setSelectedNode(null)
    setSelectedEdgeKey(null)
    setLinkingFrom(null)
    setStartId(g.nodes?.[0]?.id || null)
  }

  // ---- editing handlers ----
  function handleBackground(x, y) {
    setSelectedNode(null)
    setSelectedEdgeKey(null)
    setLinkingFrom(null)
    if (tool === 'add' && !running) {
      const id = nextLabel(graph)
      setGraph((g) => ({ ...g, nodes: [...g.nodes, { id, x, y }] }))
    }
  }

  function handleNodeClick(id) {
    if (running) return
    if (tool === 'delete') {
      setGraph((g) => ({
        ...g,
        nodes: g.nodes.filter((n) => n.id !== id),
        edges: g.edges.filter((e) => e.source !== id && e.target !== id),
      }))
      return
    }
    if (tool === 'connect') {
      if (!linkingFrom) {
        setLinkingFrom(id)
      } else if (linkingFrom === id) {
        setLinkingFrom(null)
      } else {
        addEdge(linkingFrom, id)
        setLinkingFrom(null)
      }
      return
    }
    // select tool
    setSelectedNode(id)
    setSelectedEdgeKey(null)
    if (algo?.needsStart) setStartId(id)
  }

  function addEdge(a, b) {
    setGraph((g) => {
      const exists = g.edges.some(
        (e) =>
          (e.source === a && e.target === b) ||
          (!g.directed && e.source === b && e.target === a),
      )
      if (exists) return g
      return {
        ...g,
        edges: [...g.edges, { source: a, target: b, weight: g.weighted ? 1 : undefined }],
      }
    })
  }

  function handleEdgeClick(e) {
    if (running) return
    const key = `${e.source}|${e.target}`
    if (tool === 'delete') {
      setGraph((g) => ({ ...g, edges: g.edges.filter((x) => !(x.source === e.source && x.target === e.target)) }))
      return
    }
    setSelectedEdgeKey(key)
    setSelectedNode(null)
  }

  function changeWeight(delta) {
    if (!selectedEdgeKey) return
    const [s, t] = selectedEdgeKey.split('|')
    setGraph((g) => ({
      ...g,
      edges: g.edges.map((e) =>
        e.source === s && e.target === t
          ? { ...e, weight: Math.max(1, (e.weight ?? 1) + delta) }
          : e,
      ),
    }))
    invalidateRun()
  }

  function moveNode(id, x, y) {
    setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }))
  }

  function toggleDirected() {
    invalidateRun()
    setGraph((g) => ({ ...g, directed: !g.directed }))
  }
  function toggleWeighted() {
    invalidateRun()
    setGraph((g) => ({
      ...g,
      weighted: !g.weighted,
      edges: g.edges.map((e) => ({ ...e, weight: !g.weighted ? (e.weight ?? 1) : e.weight })),
    }))
  }

  function execute() {
    if (graph.nodes.length === 0) return
    const start = algo?.needsStart ? startId || graph.nodes[0].id : null
    const s = runAlgorithm(algoKey, graph, start)
    setSteps(s)
    setRunning(true)
    setActiveConceptAlgo(algo?.concept || algoKey)
    setTimeout(() => player.play(), 50)
  }

  const cur = running ? player.current : null
  const selectedEdge = selectedEdgeKey
    ? graph.edges.find((e) => `${e.source}|${e.target}` === selectedEdgeKey)
    : null

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-panel p-2">
        <select
          value={graph.id}
          onChange={(e) => loadExample(e.target.value)}
          className="rounded-lg border border-line bg-panel-2 px-2 py-1.5 text-sm text-ink"
          title="Carregar grafo de exemplo"
        >
          {EXAMPLE_GRAPHS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
          <option value="custom">+ Grafo em branco</option>
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 p-1">
          {TOOLS.map((t) => {
            const Icon = t.icon
            const active = tool === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id)
                  setLinkingFrom(null)
                }}
                title={t.label}
                disabled={running}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold disabled:opacity-40 ${
                  active ? 'bg-sky-500 text-white' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={toggleDirected}
          className={`rounded-lg border px-2.5 py-1.5 text-sm font-semibold ${
            graph.directed ? 'border-sky-500 bg-sky-500/15 text-sky-200' : 'border-line bg-panel-2 text-muted'
          }`}
        >
          {graph.directed ? '➜ Direcionado' : '— Não-direcionado'}
        </button>
        <button
          onClick={toggleWeighted}
          className={`rounded-lg border px-2.5 py-1.5 text-sm font-semibold ${
            graph.weighted ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200' : 'border-line bg-panel-2 text-muted'
          }`}
        >
          {graph.weighted ? 'Ponderado' : 'Sem peso'}
        </button>

        {selectedEdge && graph.weighted && (
          <div className="flex items-center gap-1 rounded-lg border border-pink-500/50 bg-pink-500/10 px-2 py-1">
            <Pencil size={14} className="text-pink-300" />
            <span className="text-sm text-pink-200">
              {selectedEdge.source}–{selectedEdge.target}
            </span>
            <button onClick={() => changeWeight(-1)} className="rounded bg-panel-2 p-1 text-ink hover:bg-panel">
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-mono font-bold text-ink">{selectedEdge.weight}</span>
            <button onClick={() => changeWeight(1)} className="rounded bg-panel-2 p-1 text-ink hover:bg-panel">
              <Plus size={14} />
            </button>
          </div>
        )}

        <button
          onClick={() => loadExample('custom')}
          className="ml-auto flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-sm text-muted hover:text-red-300"
          title="Limpar tudo"
        >
          <Trash2 size={15} /> Limpar
        </button>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="relative min-h-0 flex-1 rounded-xl border border-line bg-panel">
          <GraphCanvas
            graph={graph}
            nodeStates={cur?.nodeStates || {}}
            edgeStates={cur?.edgeStates || {}}
            nodeFill={cur?.nodeFill || {}}
            dist={cur?.dist || null}
            labels={cur?.labels || null}
            transpose={cur?.transpose || false}
            selectedNode={selectedNode}
            selectedEdgeKey={selectedEdgeKey}
            linkingFrom={linkingFrom}
            draggableNodes={tool === 'select' && !running}
            bgCursor={tool === 'add' && !running ? 'crosshair' : 'default'}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onBackgroundClick={handleBackground}
            onNodeMove={moveNode}
          />
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/40 px-2.5 py-1 text-xs text-muted">
            {running
              ? 'Executando — clique em "Editar grafo" para voltar a editar'
              : tool === 'add'
              ? 'Clique na tela para criar um vértice'
              : tool === 'connect'
              ? linkingFrom
                ? `Clique no destino para conectar a partir de ${linkingFrom}`
                : 'Clique em dois vértices para criar uma aresta'
              : tool === 'delete'
              ? 'Clique em um vértice ou aresta para apagar'
              : 'Arraste vértices para mover · clique em aresta para editar peso'}
          </div>
        </div>

        {/* right panel */}
        <div className="flex w-[380px] shrink-0 flex-col gap-3 rounded-xl border border-line bg-panel p-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Algoritmo
            </label>
            <select
              value={algoKey}
              onChange={(e) => {
                setAlgoKey(e.target.value)
                invalidateRun()
              }}
              className="w-full rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-ink"
            >
              {availableAlgos.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {algo?.needsStart && (
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-sm text-muted">Origem:</span>
                  <select
                    value={startId || ''}
                    onChange={(e) => {
                      setStartId(e.target.value)
                      invalidateRun()
                    }}
                    className="flex-1 rounded-lg border border-line bg-panel-2 px-2 py-1.5 text-sm text-ink"
                  >
                    {graph.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!running ? (
                <button
                  onClick={execute}
                  disabled={graph.nodes.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-40"
                >
                  <Play size={16} /> Executar
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRunning(false)
                    setSteps([])
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-bold text-ink hover:bg-panel"
                >
                  <Pencil size={15} /> Editar grafo
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {running ? (
              <StepPanel
                step={cur}
                pseudocode={algo?.pseudocode || []}
                algoName={algo?.name}
                index={player.index}
                total={player.total}
                controls={{
                  playing: player.playing,
                  onPlay: player.play,
                  onPause: player.pause,
                  onStep: player.stepForward,
                  onBack: player.stepBack,
                  onReset: player.reset,
                  canStep: !player.atEnd,
                  canBack: player.index > 0,
                  speed,
                  onSpeed: setSpeed,
                }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-center text-sm text-muted">
                <Spline size={28} className="text-slate-600" />
                <p className="max-w-[260px]">
                  Construa ou carregue um grafo, escolha um algoritmo e clique em{' '}
                  <b className="text-emerald-300">Executar</b> para ver a animação passo a passo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
