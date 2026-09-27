import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName } from '@pixiv/three-vrm'
import { RIM } from '@/render/materials'
import { time } from '@/render/time'
import { createMotion, stepMotion } from './avatarMotion'
import { playerState } from './playerState'

const BONES = [
  'spine',
  'chest',
  'head',
  'leftUpperArm',
  'leftLowerArm',
  'rightUpperArm',
  'rightLowerArm',
  'leftUpperLeg',
  'leftLowerLeg',
  'rightUpperLeg',
  'rightLowerLeg',
] as const satisfies readonly VRMHumanBoneName[]

type MToonLike = THREE.Material & {
  parametricRimColorFactor?: THREE.Color
  parametricRimFresnelPowerFactor?: number
  parametricRimLiftFactor?: number
  rimLightingMixFactor?: number
  shadeColorFactor?: THREE.Color
}

/**
 * A VRM character (MToon anime shading) animated procedurally. Rim colour
 * follows the zone's RIM uniform; shade colour is pulled toward the night
 * palette's blue so shadows match the world.
 */
export function VrmAvatar({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })
  const vrm = gltf.userData.vrm as VRM

  const { bones, materials } = useMemo(() => {
    VRMUtils.removeUnnecessaryVertices(gltf.scene)
    VRMUtils.combineSkeletons(gltf.scene)
    vrm.scene.traverse((o) => {
      o.frustumCulled = false
    })
    const materials = new Set<MToonLike>()
    vrm.scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material
      for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) materials.add(m as MToonLike)
    })
    const shade = new THREE.Color('#3c3fa0')
    for (const m of materials) {
      if (m.parametricRimFresnelPowerFactor !== undefined) m.parametricRimFresnelPowerFactor = 4
      if (m.parametricRimLiftFactor !== undefined) m.parametricRimLiftFactor = 0.05
      if (m.rimLightingMixFactor !== undefined) m.rimLightingMixFactor = 1
      m.shadeColorFactor?.lerp(shade, 0.45)
    }
    const bones = Object.fromEntries(BONES.map((n) => [n, vrm.humanoid.getNormalizedBoneNode(n)])) as Record<(typeof BONES)[number], THREE.Object3D | null>
    return { bones, materials }
  }, [gltf, vrm])

  useEffect(() => () => VRMUtils.deepDispose(vrm.scene), [vrm])

  const motion = useMemo(createMotion, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const pose = stepMotion(motion, dt, playerState.speed > 0.3, playerState.running, time.value)
    const b = bones
    b.leftUpperLeg?.rotation.set(pose.leftUpperLegX, 0, 0)
    b.rightUpperLeg?.rotation.set(pose.rightUpperLegX, 0, 0)
    b.leftLowerLeg?.rotation.set(pose.leftLowerLegX, 0, 0)
    b.rightLowerLeg?.rotation.set(pose.rightLowerLegX, 0, 0)
    b.leftUpperArm?.rotation.set(...pose.leftUpperArm)
    b.rightUpperArm?.rotation.set(...pose.rightUpperArm)
    b.leftLowerArm?.rotation.set(0, pose.leftLowerArmY, 0)
    b.rightLowerArm?.rotation.set(0, pose.rightLowerArmY, 0)
    b.spine?.rotation.set(0, pose.spineY, 0)
    b.chest?.rotation.set(pose.chestX, 0, 0)
    b.head?.rotation.set(pose.headX, 0, 0)
    vrm.scene.position.y = pose.bob
    vrm.expressionManager?.setValue('blink', pose.blink)
    for (const m of materials) m.parametricRimColorFactor?.copy(RIM.value)
    vrm.update(dt)
  })

  return <primitive object={vrm.scene} />
}
