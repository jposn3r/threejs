import { useGLTF } from '@react-three/drei'

/**
 * Matrix Dojo Replica — Sketchfab, CC-BY-4.0, attribution: imanboer
 *  https://sketchfab.com/3d-models/matrix-dojo-replica-b311ef14fc7c4c5ab28ba74176c4ffa6
 *
 * Wrapped in a fixed RigidBody with `colliders="trimesh"` so the visible
 * geometry doubles as collision. Trimesh is auto-generated from the mesh
 * vertices — fine for static environments, expensive for moving things.
 *
 * If the model's scale or up-axis is wrong, adjust the `scale` and
 * `rotation` props on the <primitive> below.
 */

// Using the metallic-roughness-converted GLB (scene-mr.glb) instead of the
// original scene.gltf because Sketchfab exported it with the deprecated
// KHR_materials_pbrSpecularGlossiness extension, which Three.js no longer
// supports. Conversion was done with `gltf-transform metalrough`.
const URL = '/environments/matrix-dojo/scene-mr.glb'

// 3× scale — gives the dojo proper game-feel proportions
// (~37m × 16m × 30m).
const SCALE = 3

export function MatrixDojo() {
  const { scene } = useGLTF(URL)
  // No collision on the dojo geometry itself — trimesh against 181k verts
  // tanked perf and wedged the player. Floor + walls are hand-tuned cuboid
  // colliders in Scene.tsx for now. We can layer in finer collision per
  // feature (pillars, mirror, etc.) when worth it.
  return <primitive object={scene} scale={SCALE} />
}

// Drei's loader caches by URL, but explicit preload helps the loading screen
// know what to wait for once we add one in M5.
useGLTF.preload(URL)
