# More Attention

Expo React Native focus timer (Android-first). While a session runs, the **rear camera** watches for your face. If you pick up the phone or leave the frame, the app vibrates and plays an alert until your face is detected again, then resumes the timer.

## Requirements

- Node 20+
- Physical Android device recommended (rear camera + vibration)
- Android Studio / SDK for `expo run:android`, **or** an Expo account for EAS Build

**Face detection does not work in Expo Go** (Vision Camera + ML Kit need a native build). Expo Go still loads the timer UI with a mock “simulate pickup” toggle.

## Quick start (full features on Android)

```bash
npm install
npx expo run:android
```

This prebuilds native projects, compiles a debug app with camera + face detection, and installs it on the connected device/emulator.

### USB device checklist

1. Enable **Developer options** → **USB debugging** on the phone.
2. Connect via USB and accept the debugging prompt.
3. Confirm the device is visible: `adb devices`.
4. From the repo root run `npm install` then `npx expo run:android`.

### EAS preview APK (shareable, no local Android SDK)

```bash
npm install
npm i -g eas-cli
eas login
eas build --profile preview --platform android
```

Install the APK from the build page link on your phone.

### Expo Go (timer UI / mock face only)

```bash
npm install
npx expo start
```

Scan the QR code. Use **Simulate phone pickup** / **Simulate face returned** to exercise distraction alerts without native face detection.

## Permissions

| Permission | Why |
| --- | --- |
| Camera | Rear camera preview + on-device face detection |
| Vibrate | Distraction alert pattern |
| Audio | Looping alert beep (`assets/alert.wav`) |

Declared in `app.json`. Camera is requested at runtime when a monitored session needs it.

## How to use

1. Prop the phone so the **rear** camera sees your face (beside/behind the laptop).
2. Pick a duration (5–60 min) → **Start**.
3. Work. If the face is gone for ~1.5s → vibration + sound; timer freezes.
4. Put the phone back; when a face is stable (~0.5s) → alerts stop and the timer resumes.
5. **Pause** / **Stop** as needed.

Grace / recover timings live in `src/constants.ts`.

## Project layout

```
App.tsx                 UI shell
src/hooks/              Timer + alert logic
src/components/         Timer, controls, face monitor
assets/alert.wav        Alert tone
app.json                Permissions + Expo config plugins
plugins/                Android Gradle 9.4.1 + AGP9 Kotlin/ProGuard fixes (prebuild)
eas.json                preview / development APK profiles
docs/focus-app-plan.md  Architecture and known limits
```

## Stack

- Expo SDK 58 (managed) + `expo-dev-client`
- `react-native-vision-camera` **5.2.3** + `react-native-vision-camera-face-detector` **2.1.0** (ML Kit) + Nitro (`react-native-nitro-modules` **0.37.1**, `react-native-nitro-image` **0.15.2**)
- `expo-av` (alert sound), `expo-haptics` / `Vibration`

**Vision Camera v5 has no Expo config plugin.** Camera permission text lives in `app.json` → `ios.infoPlist` / `android.permissions` (do not add `react-native-vision-camera` under `plugins` — Expo would load the package main entry and fail with `Cannot find module '.../lib/CameraDevices'`).

See [`docs/focus-app-plan.md`](docs/focus-app-plan.md) for architecture and known limits.
