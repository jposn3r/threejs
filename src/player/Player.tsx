import { useRef } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import { CharacterController } from './CharacterController'
import { ThirdPersonCamera } from './ThirdPersonCamera'

/**
 * Composes the character controller with its trailing camera.
 *
 * Owns the shared `bodyRef` so the camera can read translation each frame
 * without prop-drilling or context. When EntityStore lands (M10), this ref
 * gets replaced by a Zustand subscription.
 */
export function Player() {
  const bodyRef = useRef<RapierRigidBody>(null!)
  return (
    <>
      <CharacterController bodyRef={bodyRef} />
      <ThirdPersonCamera targetRef={bodyRef} />
    </>
  )
}
