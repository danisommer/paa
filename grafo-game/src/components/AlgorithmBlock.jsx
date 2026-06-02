import { GripVertical, Plus, X, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react'

// A draggable pseudocode block used in the Arena.
// `revealed` controls whether correctness colours are shown (only after running).
export default function AlgorithmBlock({
  block,
  variant = 'palette', // 'palette' | 'program'
  revealed = false,
  errorHere = false,
  executing = false,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  index,
}) {
  let border = 'border-line'
  let bg = 'bg-panel-2'
  if (revealed && variant === 'program') {
    if (block.kind === 'correct') {
      border = 'border-emerald-500/60'
      bg = 'bg-emerald-500/10'
    } else if (block.kind === 'wrong') {
      border = 'border-red-500/60'
      bg = 'bg-red-500/10'
    } else if (block.kind === 'inefficient') {
      border = 'border-amber-400/60'
      bg = 'bg-amber-400/10'
    }
  }
  if (errorHere) {
    border = 'border-red-500'
    bg = 'bg-red-500/20'
  }
  if (executing) {
    border = 'border-sky-400'
    bg = 'bg-sky-400/20'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group flex items-center gap-2 rounded-lg border ${border} ${bg} px-2.5 py-2 transition-colors`}
    >
      <GripVertical size={16} className="shrink-0 cursor-grab text-slate-500" />
      <span className="flex-1 text-[13px] leading-snug text-ink">{block.text}</span>

      {revealed && variant === 'program' && block.kind === 'inefficient' && (
        <span title="Funciona, mas é ineficiente">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
        </span>
      )}

      {variant === 'palette' && (
        <button
          onClick={onAdd}
          className="shrink-0 rounded-md p-1 text-sky-400 hover:bg-sky-400/10"
          title="Adicionar ao programa"
        >
          <Plus size={16} />
        </button>
      )}

      {variant === 'program' && (
        <div className="flex shrink-0 items-center">
          <button
            onClick={onMoveUp}
            className="rounded p-0.5 text-slate-500 hover:text-ink"
            title="Mover para cima"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={onMoveDown}
            className="rounded p-0.5 text-slate-500 hover:text-ink"
            title="Mover para baixo"
          >
            <ChevronDown size={15} />
          </button>
          <button
            onClick={onRemove}
            className="rounded p-0.5 text-slate-500 hover:text-red-400"
            title="Remover"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {variant === 'program' && index != null && (
        <span className="w-5 shrink-0 text-right text-xs font-mono text-slate-600">{index + 1}</span>
      )}
    </div>
  )
}
