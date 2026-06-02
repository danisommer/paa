import { useEffect, useMemo, useState } from 'react'
import { Play, RotateCcw, Trophy, Pause, SkipForward, Undo2 } from 'lucide-react'
import GraphCanvas from '../components/GraphCanvas'
import AlgorithmBlock from '../components/AlgorithmBlock'
import BlockDropZone from '../components/BlockDropZone'
import { useStepPlayer } from '../components/useStepPlayer'
import { ARENA, ARENA_LIST, evaluateProgram } from '../data/arenaBlocks'
import { runAlgorithm, ALGORITHMS } from '../algorithms/index'
import { cloneGraph } from '../data/exampleGraphs'
import { useGameStore } from '../store/gameStore'

function shuffle(arr, seed) {
  // deterministic shuffle so the layout is stable per algorithm
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ArenaMode() {
  const [algoKey, setAlgoKey] = useState('dijkstra')
  const entry = ARENA[algoKey]
  const algoMeta = ALGORITHMS[entry.algoKey]
  const graph = useMemo(() => cloneGraph(entry.graph), [algoKey])
  const [programIds, setProgramIds] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState(null)
  const [steps, setSteps] = useState([])
  const speed = useGameStore((s) => s.settings.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setArenaScore = useGameStore((s) => s.setArenaScore)
  const setActiveConceptAlgo = useGameStore((s) => s.setActiveConceptAlgo)
  const arenaScores = useGameStore((s) => s.arenaScores)

  const player = useStepPlayer(steps, speed)

  const paletteBlocks = useMemo(() => shuffle(entry.blocks, entry.blocks.length * 7), [algoKey])
  const programBlocks = programIds.map((id) => entry.blocks.find((b) => b.id === id)).filter(Boolean)

  function resetAll() {
    setProgramIds([])
    setRevealed(false)
    setResult(null)
    setSteps([])
  }

  useEffect(() => {
    resetAll()
    setActiveConceptAlgo(entry.algoKey)
  }, [algoKey])

  function addBlock(id, at = null) {
    if (revealed) return
    setProgramIds((p) => {
      if (p.includes(id)) return p
      if (at == null || at >= p.length) return [...p, id]
      const copy = [...p]
      copy.splice(at, 0, id)
      return copy
    })
  }
  function removeBlock(i) {
    if (revealed) return
    setProgramIds((p) => p.filter((_, idx) => idx !== i))
  }
  function moveBlock(i, dir) {
    if (revealed) return
    setProgramIds((p) => {
      const j = i + dir
      if (j < 0 || j >= p.length) return p
      const copy = [...p]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }
  function reorder(from, to) {
    if (revealed) return
    setProgramIds((p) => {
      const copy = [...p]
      const [m] = copy.splice(from, 1)
      copy.splice(Math.max(0, Math.min(to, copy.length)), 0, m)
      return copy
    })
  }

  function execute() {
    if (programBlocks.length === 0) return
    const res = evaluateProgram(entry, programBlocks)
    setResult(res)
    setRevealed(true)
    setArenaScore(algoKey, res.score)
    // animate the REAL algorithm so the player sees the correct behaviour
    const s = runAlgorithm(entry.algoKey, graph, entry.start)
    setSteps(s)
    setActiveConceptAlgo(entry.algoKey)
    setTimeout(() => player.play(), 60)
  }

  const cur = steps.length ? player.current : null
  const execIndex =
    revealed && result?.status !== 'wrong' && steps.length
      ? Math.min(programBlocks.length - 1, Math.floor((player.index / Math.max(1, player.total - 1)) * programBlocks.length))
      : -1

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel p-2.5">
        <span className="text-sm font-semibold text-muted">Algoritmo:</span>
        <select
          value={algoKey}
          onChange={(e) => setAlgoKey(e.target.value)}
          className="rounded-lg border border-line bg-panel-2 px-2 py-1.5 text-sm font-semibold text-ink"
        >
          {ARENA_LIST.map((a) => (
            <option key={a.algoKey} value={a.algoKey}>
              {ALGORITHMS[a.algoKey].name}
            </option>
          ))}
        </select>
        <p className="hidden flex-1 text-sm text-muted md:block">
          Arraste os blocos certos, na ordem certa, para montar o algoritmo. Cuidado com blocos
          <span className="text-red-300"> errados</span> e
          <span className="text-amber-300"> ineficientes</span>.
        </p>
        {arenaScores[algoKey] != null && (
          <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">
            <Trophy size={13} /> melhor: {arenaScores[algoKey]}
          </span>
        )}
        <button
          onClick={resetAll}
          className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-sm text-muted hover:text-ink"
        >
          <RotateCcw size={15} /> Reiniciar
        </button>
      </div>

      {/* body */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
        {/* graph */}
        <div className="col-span-5 flex min-h-0 flex-col rounded-xl border border-line bg-panel">
          <div className="relative min-h-0 flex-1">
            <GraphCanvas
              graph={graph}
              nodeStates={cur?.nodeStates || {}}
              edgeStates={cur?.edgeStates || {}}
              nodeFill={cur?.nodeFill || {}}
              dist={cur?.dist || null}
              labels={cur?.labels || null}
              transpose={cur?.transpose || false}
            />
            {cur?.message && (
              <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg bg-black/70 px-3 py-2 text-sm text-sky-100">
                {cur.message}
              </div>
            )}
          </div>
          {steps.length > 0 && (
            <div className="flex items-center gap-2 border-t border-line p-2">
              <button onClick={player.stepBack} disabled={player.index === 0} className="rounded-lg border border-line bg-panel-2 p-2 text-ink disabled:opacity-40">
                <Undo2 size={15} />
              </button>
              <button
                onClick={player.playing ? player.pause : player.play}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-2 text-sm font-bold text-white"
              >
                {player.playing ? <Pause size={15} /> : <Play size={15} />}
                {player.playing ? 'Pausar' : 'Reproduzir'}
              </button>
              <button onClick={player.stepForward} disabled={player.atEnd} className="rounded-lg border border-line bg-panel-2 p-2 text-ink disabled:opacity-40">
                <SkipForward size={15} />
              </button>
              <input
                type="range"
                min="1"
                max="10"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20 accent-sky-400"
              />
            </div>
          )}
        </div>

        {/* palette */}
        <div className="col-span-3 flex min-h-0 flex-col rounded-xl border border-line bg-panel p-3">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Paleta de blocos</h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {paletteBlocks.map((b) => {
              const used = programIds.includes(b.id)
              return (
                <div key={b.id} className={used ? 'opacity-30' : ''}>
                  <AlgorithmBlock
                    block={b}
                    variant="palette"
                    onAdd={() => addBlock(b.id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({ from: 'palette', blockId: b.id }))
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* program */}
        <div className="col-span-4 flex min-h-0 flex-col gap-2 rounded-xl border border-line bg-panel p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Programa</h3>
            <span className="text-xs text-muted">{programBlocks.length} blocos</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <BlockDropZone
              program={programBlocks}
              revealed={revealed}
              executingIndex={execIndex}
              errorIndex={result?.status === 'wrong' ? result.errorIndex : -1}
              onRemove={removeBlock}
              onMove={moveBlock}
              onReorder={reorder}
              onDropFromPalette={(id, at) => addBlock(id, at)}
            />
          </div>

          {!revealed ? (
            <button
              onClick={execute}
              disabled={programBlocks.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-40"
            >
              <Play size={16} /> Executar
            </button>
          ) : (
            <div
              className={`rounded-lg border p-3 ${
                result.status === 'correct'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : result.status === 'inefficient'
                  ? 'border-amber-400/50 bg-amber-400/10'
                  : 'border-red-500/50 bg-red-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{result.message}</span>
                <span
                  className={`text-2xl font-extrabold ${
                    result.status === 'correct'
                      ? 'text-emerald-300'
                      : result.status === 'inefficient'
                      ? 'text-amber-300'
                      : 'text-red-300'
                  }`}
                >
                  {result.score}
                </span>
              </div>
              <button
                onClick={resetAll}
                className="mt-2 w-full rounded-lg border border-line bg-panel-2 py-1.5 text-sm font-semibold text-ink hover:bg-panel"
              >
                Tentar de novo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
