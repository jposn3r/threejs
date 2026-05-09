import { useEffect, useState } from 'react'

/**
 * React hook that tracks whether the pointer is currently locked.
 * Use it in HUD components to render lock/unlock affordances.
 */
export function usePointerLock(): boolean {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  return locked
}
