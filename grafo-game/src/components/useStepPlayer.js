import { useCallback, useEffect, useRef, useState } from 'react'

// Drives forward/back playback over a precomputed array of steps.
export function useStepPlayer(steps, speed = 4) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)

  const total = steps.length
  const atEnd = index >= total - 1

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const stepForward = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(0, total - 1)))
  }, [total])

  const stepBack = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])

  const play = useCallback(() => {
    if (atEnd) setIndex(0)
    setPlaying(true)
  }, [atEnd])

  const pause = useCallback(() => setPlaying(false), [])

  // auto-advance
  useEffect(() => {
    clearTimer()
    if (!playing) return
    if (index >= total - 1) {
      setPlaying(false)
      return
    }
    const delay = Math.max(120, 1150 - speed * 105)
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, total - 1))
    }, delay)
    return clearTimer
  }, [playing, index, total, speed])

  // reset when the steps array changes identity
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  return {
    index,
    setIndex,
    playing,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    total,
    atEnd,
    current: steps[index] || null,
  }
}
