import { StyleSheet, Text, View } from 'react-native';
import type { TimerPhase } from '../hooks/useFocusTimer';
import { colors, spacing } from '../theme';

type Props = {
  phase: TimerPhase;
  facePresent: boolean;
  usingMock: boolean;
  cameraReady: boolean;
};

export function StatusBanner({
  phase,
  facePresent,
  usingMock,
  cameraReady,
}: Props) {
  let message = 'Set a duration, prop the phone so the rear camera sees your face, then Start.';
  let tone: 'neutral' | 'ok' | 'warn' = 'neutral';

  if (phase === 'running') {
    if (facePresent) {
      message = 'Face detected — stay with your work.';
      tone = 'ok';
    } else {
      message = 'Looking for your face…';
      tone = 'warn';
    }
  } else if (phase === 'distracted') {
    message = 'Face lost — put the phone back facing you.';
    tone = 'warn';
  } else if (phase === 'paused') {
    message = 'Paused. Resume when you are ready.';
  } else if (phase === 'done') {
    message = 'Nice work. Take a break, then start another session.';
    tone = 'ok';
  }

  if (!cameraReady && (phase === 'running' || phase === 'distracted')) {
    message = 'Waiting for camera permission / device…';
    tone = 'warn';
  }

  return (
    <View
      style={[
        styles.wrap,
        tone === 'ok' && styles.ok,
        tone === 'warn' && styles.warn,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      {usingMock ? (
        <Text style={styles.meta}>
          Mock face mode (Expo Go / no native camera). Use the toggle below to
          simulate face lost/found. For real detection: npx expo run:android
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ok: {
    borderColor: colors.accentDim,
  },
  warn: {
    borderColor: colors.warn,
    backgroundColor: colors.warnSoft,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
