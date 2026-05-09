import { useEffect } from 'react'
import { inputState } from './InputState'

/**
 * Keyboard input producer. Mounts window listeners and writes to inputState.
 *
 * Bindings:
 *  - WASD / Arrow keys → move
 *  - Space             → jump (edge-triggered)
 *  - Shift             → run (held)
 *  - E                 → interact (edge-triggered)
 *
 * Renders nothing. Drop one instance somewhere in the tree.
 */
export function KeyboardProducer() {
  useEffect(() => {
    const keys = new Set<string>()

    const updateMoveAndRun = () => {
      let x = 0
      let y = 0
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1
      inputState.move.set(x, y)
      // Normalize so diagonal isn't √2 faster than orthogonal
      if (inputState.move.lengthSq() > 0) inputState.move.normalize()
      inputState.run = keys.has('ShiftLeft') || keys.has('ShiftRight')
    }

    const onDown = (e: KeyboardEvent) => {
      // Ignore key-repeat — edge triggers fire once per physical press
      if (e.repeat) return
      if (e.code === 'Space') inputState.jump = true
      if (e.code === 'KeyE') inputState.interact = true
      keys.add(e.code)
      updateMoveAndRun()
    }

    const onUp = (e: KeyboardEvent) => {
      keys.delete(e.code)
      updateMoveAndRun()
    }

    // If the window loses focus mid-press, key-up may never fire — reset.
    const onBlur = () => {
      keys.clear()
      inputState.move.set(0, 0)
      inputState.run = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return null
}
