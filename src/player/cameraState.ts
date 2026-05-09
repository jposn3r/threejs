/**
 * Camera orientation state — yaw (horizontal orbit) and pitch (look up/down).
 *
 * Mutable singleton, same pattern as inputState. Read every frame in the hot
 * path (camera + character controller); writes happen in MouseProducer.
 *
 * Conventions (right-handed, Y up):
 *   yaw   — angle of the camera position around the player's Y axis.
 *           yaw = 0 puts the camera at +Z (behind a player facing -Z).
 *           yaw decreases on mouse-right so the view "rotates right."
 *   pitch — vertical look angle.
 *           pitch > 0 = look up (camera tilts up, see more sky)
 *           pitch < 0 = look down (camera tilts down, see more ground)
 *           Clamped — see PITCH_MIN / PITCH_MAX below.
 */

export interface CameraState {
  yaw: number
  pitch: number
}

export const cameraState: CameraState = {
  yaw: 0,
  pitch: 0,
}

// Pitch clamps. Asymmetric: more room to look down than up, because looking
// up pushes the player toward the bottom of the screen.
export const PITCH_MIN = -Math.PI / 6 //  -30° (look down)
export const PITCH_MAX = (23 * Math.PI) / 180 //  +23° (look up — character stays in view)
