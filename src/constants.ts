/** Brief misses (blinks / tiny occlusions) before distraction. */
export const FACE_LOST_GRACE_MS = 1500;

/** Face must stay visible this long before clearing distraction. */
export const FACE_RECOVER_MS = 500;

/** Preset focus lengths (minutes). */
export const DURATION_PRESETS_MIN = [5, 15, 25, 45, 60] as const;

export const DEFAULT_DURATION_MIN = 25;

/** Android vibration pattern: wait, buzz, pause, buzz… */
export const ALERT_VIBRATION_PATTERN = [0, 600, 200, 600, 200, 900] as const;
