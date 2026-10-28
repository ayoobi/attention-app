import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controls } from './src/components/Controls';
import { DistractionOverlay } from './src/components/DistractionOverlay';
import { DurationPicker } from './src/components/DurationPicker';
import {
  FaceMonitor,
  usesMockFaceMonitor,
} from './src/components/FaceMonitor';
import { StatusBanner } from './src/components/StatusBanner';
import { TimerDisplay } from './src/components/TimerDisplay';
import { FACE_LOST_GRACE_MS, FACE_RECOVER_MS } from './src/constants';
import { useDistractionAlerts } from './src/hooks/useDistractionAlerts';
import { useFocusTimer } from './src/hooks/useFocusTimer';
import { colors, spacing } from './src/theme';

export default function App() {
  const [facePresent, setFacePresent] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const usingMock = usesMockFaceMonitor();

  const timer = useFocusTimer({
    facePresent,
    monitoring: true,
    faceLostGraceMs: FACE_LOST_GRACE_MS,
    faceRecoverMs: FACE_RECOVER_MS,
  });

  const cameraActive =
    timer.phase === 'running' || timer.phase === 'distracted';

  useDistractionAlerts(timer.phase === 'distracted');

  const onFacePresentChange = useCallback((present: boolean) => {
    setFacePresent(present);
  }, []);

  const onReadyChange = useCallback((ready: boolean) => {
    setCameraReady(ready);
  }, []);

  const durationLocked =
    timer.phase === 'running' ||
    timer.phase === 'paused' ||
    timer.phase === 'distracted';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>More Attention</Text>
          <Text style={styles.tagline}>
            Rear camera watches that you stay at the desk.
          </Text>

          <TimerDisplay remainingMs={timer.remainingMs} phase={timer.phase} />

          <DurationPicker
            durationMs={timer.durationMs}
            disabled={durationLocked}
            onSelectMinutes={timer.setDurationMinutes}
          />

          <Controls
            phase={timer.phase}
            onStart={timer.start}
            onPause={timer.pause}
            onStop={timer.stop}
          />

          <StatusBanner
            phase={timer.phase}
            facePresent={facePresent}
            usingMock={usingMock}
            cameraReady={cameraReady || usingMock}
          />

          <FaceMonitor
            active={cameraActive}
            facePresent={facePresent}
            onFacePresentChange={onFacePresentChange}
            onReadyChange={onReadyChange}
          />
        </ScrollView>

        <DistractionOverlay visible={timer.phase === 'distracted'} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
