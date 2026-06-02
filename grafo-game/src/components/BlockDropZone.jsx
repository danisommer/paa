import AlgorithmBlock from './AlgorithmBlock'

// The "programa" area: ordered list of chosen blocks. Supports HTML5
// drag-and-drop reordering plus accessible up/down/remove buttons.
export default function BlockDropZone({
  program, // array of block objects
  revealed,
  executingIndex = -1,
  errorIndex = -1,
  onRemove,
  onMove,
  onReorder,
  onDropFromPalette,
}) {
  function handleDragStart(e, fromIndex) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ from: 'program', index: fromIndex }))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDropOn(e, toIndex) {
    e.preventDefault()
    e.stopPropagation()
    let payload
    try {
      payload = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      return
    }
    if (payload.from === 'program') {
      onReorder(payload.index, toIndex)
    } else if (payload.from === 'palette') {
      onDropFromPalette(payload.blockId, toIndex)
    }
  }

  function handleDropZone(e) {
    e.preventDefault()
    let payload
    try {
      payload = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      return
    }
    if (payload.from === 'palette') onDropFromPalette(payload.blockId, program.length)
    else if (payload.from === 'program') onReorder(payload.index, program.length - 1)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropZone}
      className="flex min-h-full flex-col gap-2 rounded-xl border-2 border-dashed border-line bg-black/20 p-3"
    >
      {program.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted">
          Arraste blocos para cá (ou use o + na paleta)
          <br />
          para montar o algoritmo na ordem correta.
        </div>
      )}
      {program.map((block, i) => (
        <div key={`${block.id}-${i}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOn(e, i)}>
          <AlgorithmBlock
            block={block}
            variant="program"
            revealed={revealed}
            executing={executingIndex === i}
            errorHere={errorIndex === i}
            index={i}
            onRemove={() => onRemove(i)}
            onMoveUp={() => onMove(i, -1)}
            onMoveDown={() => onMove(i, 1)}
            onDragStart={(e) => handleDragStart(e, i)}
          />
        </div>
      ))}
    </div>
  )
}
