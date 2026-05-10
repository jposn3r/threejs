import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { Raycaster, Vector2, type Object3D } from 'three'
import { useInteractionStore, type InteractionMetadata } from './store'

const RETICLE = new Vector2(0, 0) // screen-center
const MAX_DISTANCE = 7.2 // meters — far enough to spot specimens from a comfortable distance

/**
 * Per-frame: cast a ray from the camera through the screen-center reticle.
 * If the first hit (within MAX_DISTANCE) is inside an Interactable, set it
 * as `targeted` in the store. Otherwise clear the target.
 *
 * Walks up the Object3D parent chain from the hit point so the raycast
 * target can be the leaf mesh while the metadata lives on the wrapping
 * Interactable group.
 */
export function RaycastTarget() {
  const { camera, scene } = useThree()
  const raycaster = useMemo(() => {
    const r = new Raycaster()
    r.far = MAX_DISTANCE
    return r
  }, [])

  useFrame(() => {
    raycaster.setFromCamera(RETICLE, camera)
    const hits = raycaster.intersectObject(scene, true)

    let meta: InteractionMetadata | null = null
    for (const hit of hits) {
      const found = findInteractableMeta(hit.object)
      if (found) {
        meta = found
        break
      }
    }

    const current = useInteractionStore.getState().targeted
    if (current?.id !== meta?.id) {
      useInteractionStore.getState().setTargeted(meta)
    }
  })

  return null
}

function findInteractableMeta(obj: Object3D): InteractionMetadata | null {
  let cur: Object3D | null = obj
  while (cur) {
    const m = cur.userData?.interactableMeta as InteractionMetadata | undefined
    if (m) return m
    cur = cur.parent
  }
  return null
}
