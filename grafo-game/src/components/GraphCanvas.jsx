import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'

export const NODE_COLORS = {
  idle: '#64748b',
  active: '#facc15',
  focus: '#38bdf8',
  done: '#22c55e',
}

export const EDGE_COLORS = {
  idle: '#46587a',
  tree: '#22c55e',
  active: '#38bdf8',
  candidate: '#fbbf24',
  reject: '#ef4444',
  back: '#ef4444',
  forward: '#60a5fa',
  cross: '#a78bfa',
  path: '#f59e0b',
  selected: '#f472b6',
}

const VIEW_W = 900
const VIEW_H = 560
const R = 24

function darkText(hex) {
  // crude luminance check to choose label colour
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0b1220' : '#0b1220'
}

export default function GraphCanvas({
  graph,
  nodeStates = {},
  edgeStates = {},
  nodeFill = {},
  dist = null,
  labels = null,
  flows = null,
  transpose = false,
  highlightPath = null, // array of node ids
  selectedNode = null,
  selectedEdgeKey = null, // `${source}|${target}`
  linkingFrom = null,
  draggableNodes = false,
  bgCursor = 'default',
  onNodeClick,
  onEdgeClick,
  onBackgroundClick,
  onNodeMove,
}) {
  const svgRef = useRef(null)
  const [pointer, setPointer] = useState(null)

  const nodeById = useMemo(() => {
    const m = {}
    graph.nodes.forEach((n) => (m[n.id] = n))
    return m
  }, [graph.nodes])

  const reverseSet = useMemo(() => {
    const s = new Set()
    graph.edges.forEach((e) => s.add(`${e.source}|${e.target}`))
    return s
  }, [graph.edges])

  // path edges as a quick lookup
  const pathEdges = useMemo(() => {
    const s = new Set()
    if (highlightPath) {
      for (let i = 0; i < highlightPath.length - 1; i++) {
        s.add(`${highlightPath[i]}|${highlightPath[i + 1]}`)
        s.add(`${highlightPath[i + 1]}|${highlightPath[i]}`)
      }
    }
    return s
  }, [highlightPath])

  function edgeStateFor(e) {
    const k1 = `${e.source}->${e.target}`
    if (edgeStates[k1]) return edgeStates[k1]
    if (!graph.directed) {
      const k2 = `${e.target}->${e.source}`
      if (edgeStates[k2]) return edgeStates[k2]
    }
    return 'idle'
  }

  // screen → graph coordinate conversion
  function toGraphCoords(evt) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = evt.clientX
    pt.y = evt.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  // d3 drag for movable nodes (Lab mode)
  useEffect(() => {
    if (!draggableNodes || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    const drag = d3
      .drag()
      .container(function () {
        return this.parentNode
      })
      .on('drag', function (event) {
        const id = this.getAttribute('data-id')
        const x = Math.max(R, Math.min(VIEW_W - R, event.x))
        const y = Math.max(R, Math.min(VIEW_H - R, event.y))
        onNodeMove && onNodeMove(id, x, y)
      })
    svg.selectAll('.draggable-node').call(drag)
    return () => {
      svg.selectAll('.draggable-node').on('.drag', null)
    }
  }, [draggableNodes, graph.nodes, onNodeMove])

  function handleBackgroundClick(evt) {
    if (evt.target.closest('.gnode') || evt.target.closest('.gedge')) return
    const { x, y } = toGraphCoords(evt)
    onBackgroundClick && onBackgroundClick(x, y, evt)
  }

  function handleMouseMove(evt) {
    if (linkingFrom) setPointer(toGraphCoords(evt))
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full touch-none select-none"
      onClick={handleBackgroundClick}
      onMouseMove={handleMouseMove}
      style={{ cursor: bgCursor }}
    >
      <defs>
        {Object.entries(EDGE_COLORS).map(([k, color]) => (
          <marker
            key={k}
            id={`arrow-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* rubber-band link line (Lab connect mode) */}
      {linkingFrom && pointer && nodeById[linkingFrom] && (
        <line
          x1={nodeById[linkingFrom].x}
          y1={nodeById[linkingFrom].y}
          x2={pointer.x}
          y2={pointer.y}
          stroke="#f472b6"
          strokeWidth="3"
          strokeDasharray="6 6"
          pointerEvents="none"
        />
      )}

      {/* edges */}
      <g>
        {graph.edges.map((e, i) => {
          const s = nodeById[e.source]
          const t = nodeById[e.target]
          if (!s || !t) return null
          let st = edgeStateFor(e)
          const ekey = `${e.source}|${e.target}`
          if (pathEdges.has(ekey)) st = 'path'
          if (selectedEdgeKey === ekey) st = 'selected'
          const color = EDGE_COLORS[st] || EDGE_COLORS.idle
          const thick = ['tree', 'active', 'path', 'selected', 'back', 'forward', 'cross'].includes(
            st,
          )

          // geometry
          let x1 = s.x
          let y1 = s.y
          let x2 = t.x
          let y2 = t.y
          let dx = x2 - x1
          let dy = y2 - y1
          const len = Math.hypot(dx, dy) || 1
          const ux = dx / len
          const uy = dy / len
          // perpendicular offset if a reverse edge exists (avoid overlap)
          const hasReverse = reverseSet.has(`${e.target}|${e.source}`)
          const off = hasReverse ? 11 : 0
          const px = -uy * off
          const py = ux * off
          const startGap = R
          const endGap = graph.directed ? R + 7 : R
          x1 = s.x + ux * startGap + px
          y1 = s.y + uy * startGap + py
          x2 = t.x - ux * endGap + px
          y2 = t.y - uy * endGap + py

          // weight / flow label
          const mx = (x1 + x2) / 2 - uy * 13
          const my = (y1 + y2) / 2 + ux * 13
          const showWeight = graph.weighted && e.weight != null
          const flowVal = flows ? flows[`${e.source}->${e.target}`] : null

          // arrow direction (reverse when viewing transpose)
          const markerEnd = graph.directed && !transpose ? `url(#arrow-${st})` : undefined
          const markerStart = graph.directed && transpose ? `url(#arrow-${st})` : undefined

          return (
            <g
              key={`${e.source}-${e.target}-${i}`}
              className="gedge"
              onClick={(ev) => {
                ev.stopPropagation()
                onEdgeClick && onEdgeClick(e, ev)
              }}
              style={{ cursor: onEdgeClick ? 'pointer' : 'default' }}
            >
              {/* fat invisible hit area */}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="16" />
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={thick ? 5 : 2.5}
                strokeLinecap="round"
                strokeDasharray={st === 'candidate' ? '7 6' : undefined}
                markerEnd={markerEnd}
                markerStart={markerStart}
                initial={false}
                animate={{ stroke: color, strokeWidth: thick ? 5 : 2.5 }}
                transition={{ duration: 0.3 }}
              />
              {(showWeight || flowVal != null) && (
                <g pointerEvents="none">
                  <rect
                    x={mx - 15}
                    y={my - 12}
                    width={30}
                    height={20}
                    rx={5}
                    fill="#0b1220"
                    opacity="0.85"
                  />
                  <text
                    x={mx}
                    y={my + 2}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="700"
                    fill={flowVal != null ? '#38bdf8' : '#cbd5e1'}
                  >
                    {flowVal != null ? `${flowVal}/${e.weight}` : e.weight}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </g>

      {/* nodes */}
      <g>
        {graph.nodes.map((n) => {
          const state = nodeStates[n.id] || 'idle'
          const fill = nodeFill[n.id] || NODE_COLORS[state] || NODE_COLORS.idle
          const isSel = selectedNode === n.id
          const isLink = linkingFrom === n.id
          const pulsing = state === 'focus' || state === 'active'
          const d = dist ? dist[n.id] : undefined
          const sub = labels ? labels[n.id] : undefined
          return (
            <g
              key={n.id}
              className="gnode draggable-node"
              data-id={n.id}
              transform={`translate(${n.x},${n.y})`}
              onClick={(ev) => {
                ev.stopPropagation()
                onNodeClick && onNodeClick(n.id, ev)
              }}
              style={{ cursor: onNodeClick || draggableNodes ? 'pointer' : 'default' }}
            >
              {(isSel || isLink) && (
                <circle r={R + 6} fill="none" stroke="#f472b6" strokeWidth="3" />
              )}
              <motion.circle
                r={R}
                fill={fill}
                stroke="#0b1220"
                strokeWidth="3"
                initial={false}
                animate={{
                  fill,
                  scale: pulsing ? [1, 1.12, 1] : 1,
                }}
                transition={{
                  fill: { duration: 0.3 },
                  scale: pulsing
                    ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.2 },
                }}
              />
              <text
                textAnchor="middle"
                dy="6"
                fontSize={n.id.length > 2 ? 13 : 17}
                fontWeight="800"
                fill={darkText(fill)}
                pointerEvents="none"
              >
                {n.id}
              </text>
              {/* distance badge */}
              {d !== undefined && (
                <g pointerEvents="none">
                  <rect x={-22} y={-R - 22} width={44} height={20} rx={6} fill="#1b2740" stroke="#2a3a57" />
                  <text x={0} y={-R - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="#e6edf6">
                    {d === Infinity ? '∞' : d}
                  </text>
                </g>
              )}
              {/* extra label (timestamps / pairs) */}
              {sub && (
                <text
                  x={0}
                  y={R + 18}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#93a4be"
                  pointerEvents="none"
                >
                  {sub}
                </text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
