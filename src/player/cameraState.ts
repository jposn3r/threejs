/**
 * Third-person orbit camera state — mutable singleton, read every frame by
 * the camera and the traveler, written by the pointer producer.
 *
 * Conventions (right-handed, Y up):
 *   yaw   — angle of the camera around the traveler. yaw = 0 puts the camera
 *           at +Z, behind a traveler facing −Z. Dragging right decreases yaw.
 *   pitch — elevation of the camera above the traveler. pitch > 0 = camera
 *           higher, looking down; pitch < 0 = camera low, looking up.
 *   dist  — orbit distance in metres (scroll / pinch to zoom).
 */
export interface CameraState {
  yaw: number
  pitch: number
  dist: number
}

export const cameraState: CameraState = {
  yaw: 0,
  pitch: 0.16,
  dist: 5.2,
}

export const PITCH_MIN = -0.35
export const PITCH_MAX = 0.95
export const DIST_MIN = 2.6
export const DIST_MAX = 14
