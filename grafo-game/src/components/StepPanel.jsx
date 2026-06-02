import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, Undo2, RotateCcw } from 'lucide-react'

const STATE_RING = {
  done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  active: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
  focus: 'bg-sky-400/20 text-sky-200 border-sky-400/50',
  idle: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
}

const CLASS_COLOR = {
  tree: 'border-emerald-500/60 text-emerald-300',
  back: 'border-red-500/60 text-red-300',
  forward: 'border-sky-400/60 text-sky-300',
  cross: 'border-violet-400/60 text-violet-300',
}

function Chip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm font-bold ${className}`}
    >
      {children}
    </span>
  )
}

function TableStruct({ s }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-panel-2 text-muted">
            {s.columns.map((c) => (
              <th key={c} className="px-2 py-1.5 text-left font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r, i) => (
            <tr key={i} className="border-t border-line/60">
              {r.cells.map((cell, j) => (
                <td
                  key={j}
                  className={`px-2 py-1 font-mono ${
                    j === 0 ? 'font-extrabold text-ink' : 'text-ink/90'
                  }`}
                >
                  {j === 0 ? (
                    <span
                      className={`inline-block rounded px-1.5 ${
                        STATE_RING[r.state] || ''
                      } border`}
                    >
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QueueStruct({ s, stack }) {
  return (
    <div className={`flex gap-2 ${stack ? 'flex-col items-start' : 'flex-wrap items-center'}`}>
      {s.items.length === 0 && <span className="text-sm text-muted">(vazia)</span>}
      {s.items.map((it, i) => (
        <motion.div
          key={`${it.label}-${i}`}
          layout
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex min-w-9 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-sm font-bold text-sky-200"
        >
          {it.label}
          {it.sub && <span className="ml-1 text-xs text-muted">{it.sub}</span>}
        </motion.div>
      ))}
    </div>
  )
}

function PQueueStruct({ s }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {s.items.length === 0 && <span className="text-sm text-muted">(vazia)</span>}
      {s.items.map((it, i) => (
        <motion.div
          key={`${it.label}-${i}`}
          layout
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-bold ${
            it.current
              ? 'border-sky-400 bg-sky-400/20 text-sky-100'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-100'
          }`}
        >
          <span>{it.label}</span>
          <span className="rounded bg-black/30 px-1 text-xs font-mono">{it.key}</span>
        </motion.div>
      ))}
    </div>
  )
}

function ListStruct({ s }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {s.items.length === 0 && <span className="text-sm text-muted">(vazia)</span>}
      {s.items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {s.ordered && i > 0 && <span className="text-muted">→</span>}
          <Chip className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
            {it.label}
          </Chip>
        </div>
      ))}
    </div>
  )
}

function EdgesStruct({ s }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {s.items.map((it, i) => {
        const cls =
          it.state === 'tree'
            ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
            : it.state === 'reject'
            ? 'border-red-500/40 bg-red-500/10 text-red-300/70 line-through'
            : it.state === 'active'
            ? 'border-sky-400 bg-sky-400/20 text-sky-100'
            : 'border-slate-600/60 bg-slate-700/30 text-slate-300'
        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-bold ${cls}`}
          >
            {it.label}
            <span className="rounded bg-black/30 px-1 text-xs font-mono">{it.w}</span>
          </span>
        )
      })}
    </div>
  )
}

function UnionFindStruct({ s }) {
  return (
    <div className="flex flex-wrap gap-2">
      {s.sets.map((set, i) => (
        <div
          key={i}
          className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2 py-1"
        >
          {set.map((id) => (
            <span key={id} className="rounded bg-slate-700/60 px-1.5 py-0.5 text-sm font-bold text-ink">
              {id}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function GroupsStruct({ s }) {
  return (
    <div className="flex flex-wrap gap-2">
      {s.groups.map((g, i) => (
        <div
          key={i}
          className="flex items-center gap-1 rounded-lg border px-2 py-1"
          style={{ borderColor: g.color, backgroundColor: g.color + '22' }}
        >
          {g.ids.map((id) => (
            <span
              key={id}
              className="rounded px-1.5 py-0.5 text-sm font-extrabold"
              style={{ backgroundColor: g.color, color: '#0b1220' }}
            >
              {id}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function ClassesStruct({ s }) {
  if (!s.items.length) return <span className="text-sm text-muted">(nenhuma ainda)</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {s.items.map((it, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 rounded-md border bg-black/20 px-2 py-1 text-xs font-bold ${
            CLASS_COLOR[it.type] || ''
          }`}
        >
          <span className="font-mono">{it.label}</span>
          <span className="opacity-70">{it.name}</span>
        </span>
      ))}
    </div>
  )
}

function MatrixStruct({ s }) {
  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-1"></th>
            {s.head.map((h) => (
              <th
                key={h}
                className={`p-1 font-bold ${h === s.kCol ? 'text-sky-300' : 'text-muted'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => (
            <tr key={r.label}>
              <td
                className={`p-1 font-bold ${r.label === s.kCol ? 'text-sky-300' : 'text-muted'}`}
              >
                {r.label}
              </td>
              {r.cells.map((c, j) => (
                <td
                  key={j}
                  className={`border border-line px-2 py-1 text-center font-mono ${
                    c.diag ? 'text-slate-500' : 'text-ink'
                  } ${c.changed ? 'bg-emerald-500/30' : ''}`}
                >
                  {c.v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodesStruct({ s }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(s.codes).map(([sym, code]) => (
        <span
          key={sym}
          className="inline-flex items-center gap-1 rounded-md border border-violet-400/50 bg-violet-400/10 px-2 py-1 text-sm"
        >
          <b className="text-violet-200">{sym}</b>
          <span className="font-mono text-ink">{code}</span>
        </span>
      ))}
    </div>
  )
}

function Structure({ s }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {s.title}
      </div>
      {s.type === 'table' && <TableStruct s={s} />}
      {s.type === 'queue' && <QueueStruct s={s} />}
      {s.type === 'stack' && <QueueStruct s={s} stack />}
      {s.type === 'pqueue' && <PQueueStruct s={s} />}
      {s.type === 'list' && <ListStruct s={s} />}
      {s.type === 'edges' && <EdgesStruct s={s} />}
      {s.type === 'unionfind' && <UnionFindStruct s={s} />}
      {s.type === 'groups' && <GroupsStruct s={s} />}
      {s.type === 'classes' && <ClassesStruct s={s} />}
      {s.type === 'matrix' && <MatrixStruct s={s} />}
      {s.type === 'codes' && <CodesStruct s={s} />}
    </div>
  )
}

export default function StepPanel({
  step,
  pseudocode = [],
  algoName,
  controls = null,
  index = 0,
  total = 0,
}) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      {algoName && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">{algoName}</h3>
          {total > 0 && (
            <span className="rounded-full bg-panel-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
              passo {Math.min(index + 1, total)} / {total}
            </span>
          )}
        </div>
      )}

      {/* message */}
      <motion.div
        key={step?.message}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border px-3 py-2 text-sm leading-snug ${
          step?.done
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'
            : 'border-sky-500/40 bg-sky-500/10 text-sky-100'
        }`}
      >
        {step?.message || 'Pronto para executar.'}
      </motion.div>

      {/* scrollable content */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* pseudocode */}
        {pseudocode.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Pseudocódigo
            </div>
            <pre className="overflow-x-auto rounded-lg border border-line bg-black/30 p-2 text-[13px] leading-6">
              {pseudocode.map((line, i) => (
                <div
                  key={i}
                  className={`rounded px-2 ${
                    i === step?.line
                      ? 'bg-sky-400/20 font-bold text-sky-100 ring-1 ring-sky-400/40'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="mr-2 select-none text-slate-600">{i}</span>
                  {line}
                </div>
              ))}
            </pre>
          </div>
        )}

        {/* structures */}
        {step?.structures?.map((s, i) => (
          <Structure key={i} s={s} />
        ))}
      </div>

      {/* controls */}
      {controls && (
        <div className="shrink-0 space-y-2 border-t border-line pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={controls.onBack}
              disabled={!controls.canBack}
              className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40 hover:bg-panel"
              title="Voltar um passo"
            >
              <Undo2 size={16} /> Voltar
            </button>
            <button
              onClick={controls.playing ? controls.onPause : controls.onPlay}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-sm font-bold text-white hover:bg-sky-400"
            >
              {controls.playing ? <Pause size={16} /> : <Play size={16} />}
              {controls.playing ? 'Pausar' : 'Executar'}
            </button>
            <button
              onClick={controls.onStep}
              disabled={!controls.canStep}
              className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40 hover:bg-panel"
              title="Avançar um passo"
            >
              Passo <SkipForward size={16} />
            </button>
            <button
              onClick={controls.onReset}
              className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
              title="Reiniciar"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Velocidade</span>
            <input
              type="range"
              min="1"
              max="10"
              value={controls.speed}
              onChange={(e) => controls.onSpeed(Number(e.target.value))}
              className="flex-1 accent-sky-400"
            />
            <span className="w-8 text-right font-mono text-ink">{controls.speed}x</span>
          </div>
        </div>
      )}
    </div>
  )
}
