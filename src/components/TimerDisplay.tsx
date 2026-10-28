import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { formatRemaining } from '../utils/formatTime';
import type { TimerPhase } from '../hooks/useFocusTimer';

type Props = {
  remainingMs: number;
  phase: TimerPhase;
};

export function TimerDisplay({ remainingMs, phase }: Props) {
  const label =
    phase === 'done'
      ? 'Session complete'
      : phase === 'distracted'
        ? 'Timer frozen'
        : phase === 'paused'
          ? 'Paused'
          : phase === 'running'
            ? 'Focusing'
            : 'Ready';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.time,
          phase === 'distracted' && styles.timeWarn,
          phase === 'done' && styles.timeDone,
        ]}
        accessibilityRole="timer"
      >
        {formatRemaining(remainingMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    fontFamily: 'System',
  },
  time: {
    color: colors.text,
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '300',
    letterSpacing: 2,
  },
  timeWarn: {
    color: colors.warn,
  },
  timeDone: {
    color: colors.accent,
  },
});
