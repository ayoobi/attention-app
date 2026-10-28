# More Attention — Focus App Plan

Calm focus timer for Android (Expo) that uses the **rear camera** to verify you are facing the computer. If the phone is picked up or your face leaves the frame, the app vibrates and plays an alert until you put the phone back and a face is detected again.

## Goals (MVP)

1. Set a session duration; start / pause / stop; show remaining time.
2. While running, open the **back camera** and continuously detect a face.
3. After a short grace window (~1.5s) without a face → distraction mode: strong vibration + alert sound; freeze productive time; clear “put the phone back” UI.
4. When a face is stable again → stop alerts and resume the timer.
5. Ship via Expo managed workflow + **dev client / EAS preview** (not Expo Go for face detection).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  App (Expo / React Native)                              │
│                                                         │
│  TimerEngine          FaceWatch           Alerts        │
│  - remaining ms       - rear camera       - Vibration   │
│  - start/pause/stop   - ML Kit faces      - looping beep│
│  - freeze on distract - grace + recover   - overlay UI  │
└─────────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
| --- | --- |
| **UI** | Duration chips, large remaining clock, start/pause/stop, status strip, distraction overlay, small camera preview for aiming. |
| **Timer engine** | Interval-based countdown; freezes while `distracted`; does not count time during alerts. |
| **Face watch** | Back camera + ML Kit face detector; reports `facePresent`; applies grace (~1.5s lose) and recover (~0.5s return) windows. |
| **Alerts** | Pattern vibration + looping alert sound while distracted. |

### State machine

```
idle ──start──► focusing ──face lost (grace)──► distracted
                  ▲                              │
                  └──face stable again───────────┘
                  │
               pause/stop ──► paused / idle
```

- **focusing** — timer ticks; rear camera active; face expected.
- **distracted** — timer frozen; vibrate + sound; overlay asks user to replace the phone.
- **paused** — timer frozen by user; camera can stay warm or idle; no alerts.

## Detection approach

### Chosen stack

| Piece | Choice | Why |
| --- | --- | --- |
| Camera | `react-native-vision-camera` | Reliable Android CameraX path; frame processors. |
| Faces | `react-native-vision-camera-face-detector` (ML Kit) | Real-time face boxes on device; supports **back** camera. |
| Runtime | Expo + `expo-dev-client` | Managed JS workflow; native modules via prebuild / EAS. |
| Sound | `expo-av` | Simple looping alert asset. |
| Haptics | `expo-haptics` + `Vibration` | Strong repeating pattern on Android. |

**Expo Go is not enough.** Vision Camera and the ML Kit face plugin need native code. Use:

```bash
npx expo run:android
# or
eas build --profile preview --platform android
```

### Physical setup (important)

Prop the phone so the **rear** camera looks at your face from behind or beside the laptop (e.g. stand behind the screen, camera aimed at you). You face the computer; the phone watches you. Picking up the phone (or walking away) clears the face → alert.

### Grace / recover

| Parameter | Default | Role |
| --- | --- | --- |
| `FACE_LOST_GRACE_MS` | 1500 | Ignore brief blinks / brief occlusions before alerting. |
| `FACE_RECOVER_MS` | 500 | Require a short stable face before clearing alerts. |
| Detector mode | `fast` | Prefer latency over landmark detail. |
| `cameraFacing` | `back` | Matches rear-camera placement. |

### Fallback note

If a future Expo Go-only path is required, motion (`expo-sensors`) can approximate “phone picked up,” but it cannot verify “facing the computer.” This MVP prioritizes real face detection via a custom/dev build.

## Android deploy steps

### A. Local device / emulator (fastest for development)

1. Install Android Studio + SDK / accept licenses; enable USB debugging on a physical phone (recommended for rear camera + vibration).
2. From the app folder:

```bash
cd docs/more-attention-app
npm install
npx expo run:android
```

This runs `prebuild`, builds a native debug APK with Vision Camera + ML Kit, and installs it.

### B. EAS preview APK (shareable install)

```bash
npm i -g eas-cli
eas login
eas build --profile preview --platform android
```

Install the APK from the EAS link. Profile `preview` is configured for an internal distribution APK (`eas.json`).

### C. Expo Go

You can open the project in Expo Go to skim the **timer UI only**. Camera face detection will not work there — use A or B for the full product.

### Permissions

| Permission | Platform | Purpose |
| --- | --- | --- |
| `CAMERA` | Android | Rear camera preview + face frames. |
| `VIBRATE` | Android | Distraction alert pattern. |
| `NSCameraUsageDescription` | iOS (future) | Camera usage string. |

Declared in `app.json` plugins / `android.permissions`. The app requests camera permission at runtime before starting a monitored session.

## UI direction

- Deep charcoal background (`#1A1C19`), soft sage accent (`#8FA67A`), warm off-white type — calm, readable, not purple/gradient-slop.
- One job on screen: remaining time + session controls; camera preview is a thin aiming strip, not a social feed.
- Distraction state flips accent to amber/coral and fills the overlay with a single instruction.

## Known limits

1. **Rear-camera face assumption** — ML Kit must see a face-sized region. Extreme angles, heavy backlight, or the phone too far away reduce recall. Aim the camera so your head fills a reasonable portion of the preview.
2. **Not Expo Go** — full feature set needs a native build (`expo run:android` or EAS).
3. **False positives / negatives** — someone else in frame can keep the timer running; leaving while a poster/photo of a face is visible can fail to alert. MVP does not do liveness.
4. **Grace window** — very quick phone glances under ~1.5s may not trigger; raise or lower `FACE_LOST_GRACE_MS` in `src/constants.ts`.
5. **Background** — Android may throttle camera when the app is backgrounded; keep the app foregrounded during focus sessions.
6. **Battery / heat** — continuous camera + ML Kit uses more power than a plain timer; expected for this product.
7. **Simulator** — Android emulator cameras are poor stand-ins; prefer a physical device.

## Repo / delivery layout

| Path | Contents |
| --- | --- |
| `docs/focus-app-plan.md` | This plan. |
| `docs/more-attention-app/` | Runnable Expo project (source, config, README). |

No GitHub remote is attached to this Project; copy the folder or wire a repo later if needed.

## Next steps (post-MVP)

- Session history / streaks.
- Optional accelerometer as a second pickup signal.
- Quieter “nudge” mode vs full alert.
- iOS test pass with the same Vision Camera stack.
