import { motion } from 'framer-motion'
import {
  Map as MapIcon,
  Swords,
  FlaskConical,
  BookOpen,
  Home,
  RotateCcw,
  Github,
} from 'lucide-react'
import { useGameStore } from './store/gameStore'
import MissionsMode from './modes/MissionsMode'
import ArenaMode from './modes/ArenaMode'
import LabMode from './modes/LabMode'
import ConceptsDrawer from './components/ConceptsDrawer'
import { MISSIONS, TOTAL_GRAFOS, TOTAL_GULOSOS } from './data/missions'

const MODES = {
  missions: { title: 'Missões', component: MissionsMode },
  arena: { title: 'Arena de Algoritmos', component: ArenaMode },
  lab: { title: 'Laboratório de Grafos', component: LabMode },
}

function useProgress() {
  const completed = useGameStore((s) => s.completedMissions)
  const grafos = MISSIONS.filter((m) => m.category === 'grafos' && completed[m.id]).length
  const gulosos = MISSIONS.filter((m) => m.category === 'gulosos' && completed[m.id]).length
  return { grafos, gulosos }
}

function ProgressBadge() {
  const { grafos, gulosos } = useProgress()
  return (
    <div className="flex items-center gap-3 text-xs font-semibold">
      <Bar label="Grafos" value={grafos} total={TOTAL_GRAFOS} color="bg-sky-400" />
      <Bar label="Gulosos" value={gulosos} total={TOTAL_GULOSOS} color="bg-emerald-400" />
    </div>
  )
}

function Bar({ label, value, total, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted">{label}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-panel-2">
        <div className={`h-full ${color}`} style={{ width: `${(value / total) * 100}%` }} />
      </div>
      <span className="font-mono text-ink">
        {value}/{total}
      </span>
    </div>
  )
}

function ConceptsFab() {
  const toggle = useGameStore((s) => s.toggleConcepts)
  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-105"
    >
      <BookOpen size={18} /> Conceitos
    </button>
  )
}

const ACCENT = {
  emerald: { border: 'hover:border-emerald-500/60', icon: 'bg-emerald-500/15 text-emerald-300' },
  sky: { border: 'hover:border-sky-500/60', icon: 'bg-sky-500/15 text-sky-300' },
  violet: { border: 'hover:border-violet-500/60', icon: 'bg-violet-500/15 text-violet-300' },
}

function MenuCard({ icon: Icon, title, desc, accent, onClick, footer }) {
  const a = ACCENT[accent] || ACCENT.sky
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 rounded-3xl border border-line bg-panel p-6 text-left transition-colors ${a.border}`}
    >
      <div className={`rounded-2xl p-3 ${a.icon}`}>
        <Icon size={30} />
      </div>
      <h3 className="text-xl font-extrabold text-ink">{title}</h3>
      <p className="text-sm leading-snug text-muted">{desc}</p>
      {footer}
    </motion.button>
  )
}

function MainMenu() {
  const setMode = useGameStore((s) => s.setMode)
  const reset = useGameStore((s) => s.resetProgress)
  const { grafos, gulosos } = useProgress()
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col px-6 py-10">
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-sky-400 via-emerald-300 to-violet-400 bg-clip-text text-5xl font-black tracking-tight text-transparent"
          >
            GrafoQuest
          </motion.h1>
          <p className="mt-2 text-muted">
            Aprenda <b className="text-sky-300">Grafos</b> e{' '}
            <b className="text-emerald-300">Algoritmos Gulosos</b> — Projeto e Análise de Algoritmos (UTFPR)
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-4 rounded-full border border-line bg-panel px-4 py-2">
              <ProgressBadge />
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-3">
          <MenuCard
            icon={MapIcon}
            title="Missões"
            accent="emerald"
            desc="Campanha com 12 desafios práticos baseados nos exercícios da prova. Trace caminhos, monte AGMs, encontre componentes e mais."
            onClick={() => setMode('missions')}
            footer={
              <span className="mt-1 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-emerald-300">
                {grafos + gulosos}/12 concluídas
              </span>
            }
          />
          <MenuCard
            icon={Swords}
            title="Arena de Algoritmos"
            accent="sky"
            desc="Monte o algoritmo arrastando blocos de pseudocódigo na ordem certa. Cuidado com blocos errados e ineficientes — depois veja a animação."
            onClick={() => setMode('arena')}
          />
          <MenuCard
            icon={FlaskConical}
            title="Laboratório de Grafos"
            accent="violet"
            desc="Construa seu próprio grafo, escolha um algoritmo e rode passo a passo, vendo filas, heaps, union-find e a árvore se formando."
            onClick={() => setMode('lab')}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted">
          <button
            onClick={() => {
              if (confirm('Apagar todo o progresso salvo?')) reset()
            }}
            className="flex items-center gap-1 hover:text-red-300"
          >
            <RotateCcw size={13} /> Zerar progresso
          </button>
          <span className="flex items-center gap-1">
            <Github size={13} /> 100% offline · React + D3 + Zustand + Framer Motion
          </span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)

  const ModeComp = MODES[mode]?.component

  return (
    <div className="flex h-full flex-col bg-bg">
      {mode !== 'menu' && (
        <header className="flex shrink-0 items-center gap-4 border-b border-line bg-panel px-4 py-2.5">
          <button
            onClick={() => setMode('menu')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-panel"
          >
            <Home size={16} /> Menu
          </button>
          <h1 className="text-base font-bold text-ink">{MODES[mode]?.title}</h1>
          <div className="ml-auto">
            <ProgressBadge />
          </div>
        </header>
      )}

      <main className="min-h-0 flex-1">
        {mode === 'menu' ? <MainMenu /> : ModeComp ? <ModeComp /> : null}
      </main>

      <ConceptsFab />
      <ConceptsDrawer />
    </div>
  )
}
