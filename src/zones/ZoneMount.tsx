import { useFrame, useThree } from '@react-three/fiber'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useState } from 'react'
import { Color } from 'three'
import { playerState } from '@/player/playerState'
import { PAL } from '@/render/palette'
import { useQuality } from '@/render/quality'
import { time } from '@/render/time'
import type { ZoneDef, ZoneInstance } from './types'
import { world } from './world'

/**
 * Builds a zone, mounts its scene graph and physics colliders, and drives
 * its per-frame update. Built inside an effect (not useMemo) so every build
 * is paired with exactly one dispose, including under StrictMode.
 */
export function ZoneMount({ def }: { def: ZoneDef }) {
  const [instance, setInstance] = useState<ZoneInstance | null>(null)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const quality = useQuality((s) => s.quality)

  useEffect(() => {
    const inst = def.build()
    world.def = def
    world.instance = inst
    scene.fog = inst.fog
    scene.background = new Color(PAL.sky0)
    setInstance(inst)
    return () => {
      if (world.instance === inst) world.instance = null
      scene.fog = null
      inst.dispose()
    }
  }, [def, scene])

  useEffect(() => instance?.setQuality(quality === 'high'), [instance, quality])
  useEffect(() => instance?.setSize(size.width, size.height, dpr), [instance, size, dpr])

  useFrame((_, delta) => {
    if (!instance) return
    instance.sky.position.copy(camera.position)
    instance.update(time.value, Math.min(delta, 0.1), playerState.position)
  })

  if (!instance) return null
  return (
    <>
      <primitive object={instance.group} />
      <RigidBody type="fixed" colliders={false}>
        {def.colliders.map((c, i) =>
          c.kind === 'box' ? (
            <CuboidCollider key={i} args={c.half} position={c.center} rotation={[0, c.rotY ?? 0, 0]} />
          ) : (
            <CylinderCollider key={i} args={[c.halfHeight, c.radius]} position={c.center} />
          ),
        )}
      </RigidBody>
    </>
  )
}
