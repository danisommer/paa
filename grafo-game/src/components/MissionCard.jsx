import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Star, Trophy } from 'lucide-react'

const CATEGORY_STYLE = {
  grafos: { tag: 'Grafos', color: 'text-sky-300', dot: 'bg-sky-400' },
  gulosos: { tag: 'Gulosos', color: 'text-emerald-300', dot: 'bg-emerald-400' },
}

export default function MissionCard({ mission, locked, result, onClick }) {
  const cat = CATEGORY_STYLE[mission.category]
  const done = !!result
  return (
    <motion.button
      whileHover={locked ? {} : { scale: 1.03, y: -2 }}
      whileTap={locked ? {} : { scale: 0.98 }}
      disabled={locked}
      onClick={onClick}
      className={`relative flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
        locked
          ? 'cursor-not-allowed border-line bg-panel-2/50 opacity-60'
          : done
          ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10'
          : 'border-line bg-panel-2 hover:border-sky-500/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
              done ? 'bg-emerald-500 text-white' : 'bg-panel text-muted ring-1 ring-line'
            }`}
          >
            {mission.num}
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-bold uppercase ${cat.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {cat.tag}
          </span>
        </span>
        {locked ? (
          <Lock size={18} className="text-slate-500" />
        ) : done ? (
          <CheckCircle2 size={20} className="text-emerald-400" />
        ) : mission.num === 12 ? (
          <Trophy size={18} className="text-amber-400" />
        ) : null}
      </div>

      <h3 className="font-bold leading-tight text-ink">{mission.title}</h3>
      <p className="line-clamp-2 text-[13px] leading-snug text-muted">{mission.story}</p>

      {done && (
        <div className="mt-1 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              size={15}
              className={
                result.score >= (i + 1) * 34 || (i === 0 && result.score >= 60)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600'
              }
            />
          ))}
          <span className="ml-1 text-xs font-bold text-amber-300">{result.score} pts</span>
        </div>
      )}
    </motion.button>
  )
}
