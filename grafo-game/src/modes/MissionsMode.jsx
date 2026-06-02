import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react'
import GraphCanvas from '../components/GraphCanvas'
import MissionCard from '../components/MissionCard'
import { MISSIONS, missionById } from '../data/missions'
import { useGameStore } from '../store/gameStore'

// neighbours respecting direction
function neighborsOf(graph, id) {
  const out = new Set()
  graph.edges.forEach((e) => {
    if (e.source === id) out.add(e.target)
    if (!graph.directed && e.target === id) out.add(e.source)
  })
  return out
}

const GROUP_COLORS = ['#64748b', '#38bdf8', '#f472b6', '#34d399', '#fbbf24']

function fmtTime(ms) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────
export default function MissionsMode() {
  const [activeId, setActiveId] = useState(null)
  const completed = useGameStore((s) => s.completedMissions)

  if (activeId) {
    return <MissionRunner mission={missionById(activeId)} onBack={() => setActiveId(null)} onNext={(nextId) => setActiveId(nextId)} />
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-1 text-2xl font-extrabold text-ink">Campanha — 12 Missões</h2>
        <p className="mb-5 text-sm text-muted">
          Desafios práticos baseados nos exercícios da prova. Complete em sequência para liberar as próximas.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MISSIONS.map((m, i) => {
            const prevDone = i === 0 || !!completed[MISSIONS[i - 1].id]
            const locked = !prevDone && !completed[m.id]
            return (
              <MissionCard
                key={m.id}
                mission={m}
                locked={locked}
                result={completed[m.id]}
                onClick={() => !locked && setActiveId(m.id)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
function MissionRunner({ mission, onBack, onNext }) {
  const completeMission = useGameStore((s) => s.completeMission)
  const openConcepts = useGameStore((s) => s.openConcepts)
  // initialise synchronously so widgets never see an empty state on first render
  const [state, setState] = useState(() => initialState(mission))
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const startTimeRef = useRef(Date.now())

  // reset interaction state on mission change
  useEffect(() => {
    setState(initialState(mission))
    setAttempts(0)
    setResult(null)
    setShowHint(false)
    startTimeRef.current = Date.now()
  }, [mission])

  function check() {
    const payload = toPayload(mission, state)
    const res = mission.validate(payload)
    if (res.ok) {
      const timeMs = Date.now() - startTimeRef.current
      completeMission(mission.id, { score: res.score, timeMs, errors: attempts })
      setResult({ ...res, timeMs })
    } else {
      setAttempts((a) => a + 1)
      setResult(res)
    }
  }

  const idx = MISSIONS.findIndex((m) => m.id === mission.id)
  const next = MISSIONS[idx + 1]

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft size={16} /> Missões
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-extrabold text-white">
              {mission.num}
            </span>
            <h2 className="text-lg font-bold text-ink">{mission.title}</h2>
          </div>
        </div>
        {mission.concept && (
          <button
            onClick={() => openConcepts(mission.concept)}
            className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-sm text-sky-300 hover:bg-panel"
          >
            <BookOpen size={15} /> Conceito
          </button>
        )}
        <button
          onClick={() => setShowHint((h) => !h)}
          className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-sm text-amber-300"
        >
          <Lightbulb size={15} /> Dica
        </button>
      </div>

      {/* story */}
      <div className="rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-snug text-ink/90">
        {mission.story}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-2 text-amber-200/90"
            >
              <Lightbulb size={15} className="mt-0.5 shrink-0" /> {mission.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* interaction */}
      <div className="relative min-h-0 flex-1 rounded-xl border border-line bg-panel">
        <MissionWidget mission={mission} state={state} setState={setState} result={result} />

        {/* result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
            >
              <motion.div
                initial={{ scale: 0.85, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className={`w-full max-w-md rounded-2xl border p-6 text-center ${
                  result.ok ? 'border-emerald-500/50 bg-panel' : 'border-red-500/50 bg-panel'
                }`}
              >
                {result.ok ? (
                  <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                ) : (
                  <XCircle size={48} className="mx-auto text-red-400" />
                )}
                <h3 className="mt-2 text-xl font-extrabold text-ink">
                  {result.ok ? 'Missão concluída!' : 'Ainda não...'}
                </h3>
                <p className="mt-1 text-sm text-muted">{result.message}</p>
                {result.ok && (
                  <div className="mt-3 flex justify-center gap-6 text-sm">
                    <div>
                      <div className="text-2xl font-extrabold text-amber-300">{result.score}</div>
                      <div className="text-xs text-muted">pontos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-ink">{fmtTime(result.timeMs)}</div>
                      <div className="text-xs text-muted">tempo</div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-ink">{attempts}</div>
                      <div className="text-xs text-muted">erros</div>
                    </div>
                  </div>
                )}
                <div className="mt-5 flex justify-center gap-2">
                  {!result.ok && (
                    <button
                      onClick={() => setResult(null)}
                      className="flex items-center gap-1 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400"
                    >
                      <RotateCcw size={15} /> Tentar de novo
                    </button>
                  )}
                  {result.ok && next && (
                    <button
                      onClick={() => onNext(next.id)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-400"
                    >
                      Próxima missão <ChevronRight size={16} />
                    </button>
                  )}
                  <button
                    onClick={onBack}
                    className="rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
                  >
                    {result.ok ? 'Mapa de missões' : 'Voltar'}
                  </button>
                </div>
                {mission.concept && (
                  <button
                    onClick={() => openConcepts(mission.concept)}
                    className="mx-auto mt-3 flex items-center gap-1 text-xs text-sky-400 hover:underline"
                  >
                    <BookOpen size={13} /> Revisar conceito relacionado
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setState(initialState(mission))}
          className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <RotateCcw size={15} /> Limpar
        </button>
        <button
          onClick={check}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-400"
        >
          <CheckCircle2 size={17} /> Validar resposta
        </button>
      </div>
    </div>
  )
}

// ── interaction state lifecycle ─────────────────────────────────────────────
function initialState(m) {
  switch (m.kind) {
    case 'path':
      return { pathNodes: [m.start] }
    case 'topo-order':
      return { order: [] }
    case 'mst-edges':
    case 'edge-set':
    case 'cycle':
      return { edges: [] } // array of edge objects in click order
    case 'scc-group':
      return { groups: Object.fromEntries(m.graph.nodes.map((n) => [n.id, 0])) }
    case 'maxflow':
      return { flows: Object.fromEntries(m.graph.edges.map((e) => [`${e.source}->${e.target}`, 0])) }
    case 'activity':
      return { selected: [] }
    case 'huffman':
      return {
        forest: m.freqs.map((f, i) => ({ key: `l${i}`, w: f.freq, label: f.symbol })),
        merges: [],
        pick: null,
      }
    default:
      return {}
  }
}

function toPayload(m, s) {
  switch (m.kind) {
    case 'path':
      return { pathNodes: s.pathNodes }
    case 'topo-order':
      return { order: s.order }
    case 'mst-edges':
      return { selectedEdges: (s.edges || []).map((e) => `${e.source}|${e.target}`) }
    case 'edge-set':
      return { selectedEdges: (s.edges || []).map((e) => `${e.source}->${e.target}`) }
    case 'cycle':
      return { selectedDirEdges: (s.edges || []).map((e) => [e.source, e.target]) }
    case 'scc-group':
      return { groups: s.groups }
    case 'maxflow':
      return { flows: s.flows }
    case 'activity':
      return { selected: s.selected }
    case 'huffman':
      return { merges: s.merges }
    default:
      return {}
  }
}

// ── per-kind widget ─────────────────────────────────────────────────────────
function MissionWidget({ mission, state, setState, result }) {
  switch (mission.kind) {
    case 'activity':
      return <ActivityWidget mission={mission} state={state} setState={setState} />
    case 'huffman':
      return <HuffmanWidget mission={mission} state={state} setState={setState} />
    case 'maxflow':
      return <FlowWidget mission={mission} state={state} setState={setState} />
    default:
      return <GraphWidget mission={mission} state={state} setState={setState} result={result} />
  }
}

// Graph-based widgets: path, topo-order, mst-edges, edge-set, cycle, scc-group
function GraphWidget({ mission, state, setState, result }) {
  const g = mission.graph
  const kind = mission.kind

  const nodeStates = useMemo(() => {
    const ns = {}
    g.nodes.forEach((n) => (ns[n.id] = 'idle'))
    if (kind === 'path') {
      ;(state.pathNodes || []).forEach((id) => (ns[id] = 'done'))
      const last = state.pathNodes?.[state.pathNodes.length - 1]
      if (last) ns[last] = 'focus'
    }
    if (kind === 'topo-order') {
      ;(state.order || []).forEach((id) => (ns[id] = 'done'))
    }
    return ns
  }, [g.nodes, kind, state])

  const nodeFill = useMemo(() => {
    if (kind !== 'scc-group') return {}
    const f = {}
    Object.entries(state.groups || {}).forEach(([id, gi]) => {
      if (gi) f[id] = GROUP_COLORS[gi % GROUP_COLORS.length]
    })
    return f
  }, [kind, state])

  const edgeStates = useMemo(() => {
    const es = {}
    if (['mst-edges', 'edge-set', 'cycle'].includes(kind)) {
      ;(state.edges || []).forEach((e, i) => {
        es[`${e.source}->${e.target}`] = kind === 'cycle' ? 'path' : 'tree'
        void i
      })
    }
    return es
  }, [kind, state])

  const labels = useMemo(() => {
    if (kind === 'topo-order') {
      const l = {}
      ;(state.order || []).forEach((id, i) => (l[id] = `#${i + 1}`))
      return l
    }
    return null
  }, [kind, state])

  const highlightPath = kind === 'path' ? state.pathNodes : result && !result.ok && mission.kind === 'path' ? null : null

  function onNodeClick(id) {
    if (result?.ok) return
    if (kind === 'path') {
      setState((s) => {
        const path = s.pathNodes || [mission.start]
        const last = path[path.length - 1]
        if (id === last && path.length > 1) return { ...s, pathNodes: path.slice(0, -1) } // undo
        if (path.length === 0) return { ...s, pathNodes: [id] }
        const nb = neighborsOf(g, last)
        if (nb.has(id) && !path.includes(id)) return { ...s, pathNodes: [...path, id] }
        return s
      })
    } else if (kind === 'topo-order') {
      setState((s) => {
        const order = s.order || []
        if (order[order.length - 1] === id) return { ...s, order: order.slice(0, -1) }
        if (order.includes(id)) return s
        return { ...s, order: [...order, id] }
      })
    } else if (kind === 'scc-group') {
      setState((s) => {
        const cur = s.groups[id] || 0
        const nextG = (cur + 1) % (mission.groupCount + 1)
        return { ...s, groups: { ...s.groups, [id]: nextG } }
      })
    }
  }

  function onEdgeClick(e) {
    if (result?.ok) return
    if (!['mst-edges', 'edge-set', 'cycle'].includes(kind)) return
    setState((s) => {
      const edges = s.edges || []
      const exists = edges.find((x) => x.source === e.source && x.target === e.target)
      if (exists) return { ...s, edges: edges.filter((x) => !(x.source === e.source && x.target === e.target)) }
      return { ...s, edges: [...edges, { source: e.source, target: e.target }] }
    })
  }

  return (
    <div className="flex h-full flex-col">
      <GraphCanvas
        graph={g}
        nodeStates={nodeStates}
        nodeFill={nodeFill}
        edgeStates={edgeStates}
        labels={labels}
        highlightPath={kind === 'path' ? highlightPath : null}
        onNodeClick={['path', 'topo-order', 'scc-group'].includes(kind) ? onNodeClick : undefined}
        onEdgeClick={['mst-edges', 'edge-set', 'cycle'].includes(kind) ? onEdgeClick : undefined}
      />
      {kind === 'path' && (
        <div className="border-t border-line px-3 py-2 text-sm text-muted">
          Caminho: <span className="font-mono text-ink">{(state.pathNodes || []).join(' → ') || '—'}</span>
        </div>
      )}
      {kind === 'topo-order' && (
        <div className="border-t border-line px-3 py-2 text-sm text-muted">
          Ordem: <span className="font-mono text-ink">{(state.order || []).join(' → ') || '—'}</span>
        </div>
      )}
      {kind === 'scc-group' && (
        <div className="flex items-center gap-3 border-t border-line px-3 py-2 text-xs text-muted">
          Clique para mudar de grupo:
          {GROUP_COLORS.slice(0, mission.groupCount + 1).map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: c }} />
              {i === 0 ? 'nenhum' : `grupo ${i}`}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function FlowWidget({ mission, state, setState }) {
  const g = mission.graph
  const flows = state.flows || {}
  function setFlow(key, delta, cap) {
    setState((s) => {
      const f = s.flows || {}
      const v = Math.max(0, Math.min(cap, (f[key] || 0) + delta))
      return { ...s, flows: { ...f, [key]: v } }
    })
  }
  const value = g.edges
    .filter((e) => e.source === 'S')
    .reduce((acc, e) => acc + (flows[`${e.source}->${e.target}`] || 0), 0)

  return (
    <div className="flex h-full">
      <div className="min-h-0 flex-1">
        <GraphCanvas graph={g} flows={flows} />
      </div>
      <div className="w-72 shrink-0 space-y-2 overflow-y-auto border-l border-line p-3">
        <div className="rounded-lg bg-sky-500/10 px-3 py-2 text-center">
          <div className="text-3xl font-extrabold text-sky-300">{value}</div>
          <div className="text-xs text-muted">fluxo total (S → T)</div>
        </div>
        {g.edges.map((e) => {
          const key = `${e.source}->${e.target}`
          return (
            <div key={key} className="flex items-center justify-between rounded-lg border border-line bg-panel-2 px-2 py-1.5">
              <span className="font-mono text-sm text-ink">
                {e.source}→{e.target}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setFlow(key, -1, e.weight)} className="rounded bg-panel p-1 text-ink hover:bg-black/30">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-mono text-sm">
                  <b className="text-sky-300">{flows[key] || 0}</b>
                  <span className="text-muted">/{e.weight}</span>
                </span>
                <button onClick={() => setFlow(key, 1, e.weight)} className="rounded bg-panel p-1 text-ink hover:bg-black/30">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivityWidget({ mission, state, setState }) {
  const acts = mission.activities
  const maxT = Math.max(...acts.map((a) => a.finish))
  const selected = state.selected || []

  // detect conflicts among selected for visual feedback
  function isConflicting(a) {
    return selected.some((id) => {
      if (id === a.id) return false
      const b = acts.find((x) => x.id === id)
      return a.start < b.finish && b.start < a.finish
    })
  }
  function toggle(id) {
    setState((s) => ({
      ...s,
      selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id],
    }))
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mb-3 flex items-center gap-4 text-xs text-muted">
        <span>Clique nas barras para selecionar atividades compatíveis.</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500" /> selecionada</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" /> em conflito</span>
      </div>
      <div className="space-y-2">
        {[...acts]
          .sort((a, b) => a.finish - b.finish)
          .map((a) => {
            const sel = selected.includes(a.id)
            const conflict = sel && isConflicting(a)
            return (
              <div key={a.id} className="flex items-center gap-2">
                <span className="w-8 text-right font-mono text-xs text-muted">{a.id}</span>
                <div className="relative h-8 flex-1 rounded bg-black/20">
                  <button
                    onClick={() => toggle(a.id)}
                    className={`absolute top-0 flex h-8 items-center justify-center rounded text-xs font-bold transition-colors ${
                      conflict
                        ? 'bg-red-500/80 text-white'
                        : sel
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-600/80 text-slate-200 hover:bg-slate-500'
                    }`}
                    style={{
                      left: `${(a.start / maxT) * 100}%`,
                      width: `${((a.finish - a.start) / maxT) * 100}%`,
                    }}
                    title={`início ${a.start}, término ${a.finish}`}
                  >
                    [{a.start}, {a.finish}]
                  </button>
                </div>
              </div>
            )
          })}
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted">
        <span>tempo →</span>
        <div className="flex flex-1 justify-between font-mono">
          {Array.from({ length: maxT + 1 }).map((_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        Selecionadas: <b className="text-emerald-300">{selected.length}</b>
      </p>
    </div>
  )
}

function HuffmanWidget({ state, setState }) {
  const forest = state.forest || []
  const pick = state.pick

  function clickNode(key) {
    setState((s) => {
      if (s.pick == null) return { ...s, pick: key }
      if (s.pick === key) return { ...s, pick: null }
      const a = s.forest.find((n) => n.key === s.pick)
      const b = s.forest.find((n) => n.key === key)
      if (!a || !b) return { ...s, pick: null }
      const merged = {
        key: `m${s.merges.length}-${a.key}-${b.key}`,
        w: a.w + b.w,
        label: `(${a.label}·${b.label})`,
        children: [a, b],
      }
      const forest2 = s.forest.filter((n) => n.key !== a.key && n.key !== b.key)
      forest2.push(merged)
      return { ...s, forest: forest2, pick: null, merges: [...s.merges, [a.w, b.w]] }
    })
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <p className="mb-4 text-sm text-muted">
        Clique em dois nós para combiná-los. Os nós de menor peso devem ser combinados primeiro.
        Continue até sobrar um único nó (a raiz).
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {[...forest]
          .sort((a, b) => a.w - b.w)
          .map((n) => (
            <button
              key={n.key}
              onClick={() => clickNode(n.key)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-colors ${
                pick === n.key
                  ? 'border-sky-400 bg-sky-400/20'
                  : 'border-violet-400/50 bg-violet-400/10 hover:bg-violet-400/20'
              }`}
            >
              <span className="text-2xl font-extrabold text-violet-100">{n.w}</span>
              <span className="max-w-[120px] truncate text-xs text-muted">{n.label}</span>
            </button>
          ))}
      </div>
      {forest.length === 1 && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Sobrou um único nó (raiz de peso {forest[0].w}). Clique em <b>Validar resposta</b>.
        </p>
      )}
    </div>
  )
}
