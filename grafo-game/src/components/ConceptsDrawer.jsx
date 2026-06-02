import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, BookOpen, AlertTriangle } from 'lucide-react'
import { CONCEPTS } from '../data/concepts'
import { useGameStore } from '../store/gameStore'

export default function ConceptsDrawer() {
  const open = useGameStore((s) => s.conceptsOpen)
  const close = useGameStore((s) => s.closeConcepts)
  const activeAlgo = useGameStore((s) => s.activeConceptAlgo)
  const [query, setQuery] = useState('')
  const activeRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CONCEPTS
    return CONCEPTS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q)) ||
        c.when.toLowerCase().includes(q),
    )
  }, [query])

  // scroll active fiche into view when the drawer opens
  useEffect(() => {
    if (open && activeRef.current) {
      setTimeout(() => activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }, [open, activeAlgo])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-panel shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <BookOpen size={20} className="text-sky-400" /> Fichas de Conceitos
              </h2>
              <button
                onClick={close}
                className="rounded-lg p-1.5 text-muted hover:bg-panel-2 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <div className="border-b border-line px-4 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2">
                <Search size={16} className="text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar algoritmo..."
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {filtered.map((c) => {
                const isActive = activeAlgo && c.algoKey === activeAlgo
                return (
                  <div
                    key={c.key}
                    ref={isActive ? activeRef : null}
                    className={`rounded-xl border p-3 transition-colors ${
                      isActive
                        ? 'border-sky-400 bg-sky-400/10 ring-1 ring-sky-400/40'
                        : 'border-line bg-panel-2'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-bold text-ink">{c.title}</h3>
                      {isActive && (
                        <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-300">
                          em execução
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mb-2 text-sm text-ink/90">
                      <span className="font-semibold text-muted">Quando usar: </span>
                      {c.when}
                    </p>
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-muted">Complexidade: </span>
                      <span className="font-mono text-emerald-300">{c.complexity}</span>
                    </p>
                    <pre className="mb-2 overflow-x-auto rounded-lg bg-black/30 p-2 text-[12px] leading-5 text-slate-300">
                      {c.pseudo.join('\n')}
                    </pre>
                    <div className="space-y-1">
                      {c.pitfalls.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[13px] text-amber-200/90">
                          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted">Nenhuma ficha encontrada.</p>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
