import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TimerPhase } from '../hooks/useFocusTimer';
import { colors, spacing } from '../theme';

type Props = {
  phase: TimerPhase;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
};

export function Controls({ phase, onStart, onPause, onStop }: Props) {
  const canStart = phase === 'idle' || phase === 'paused' || phase === 'done';
  const canPause = phase === 'running' || phase === 'distracted';
  const canStop = phase !== 'idle';

  return (
    <View style={styles.row}>
      {canStart ? (
        <Pressable
          style={[styles.btn, styles.primary]}
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel="Start focus session"
        >
          <Text style={styles.primaryText}>
            {phase === 'paused' ? 'Resume' : 'Start'}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.btn, styles.secondary]}
          onPress={onPause}
          disabled={!canPause}
          accessibilityRole="button"
          accessibilityLabel="Pause"
        >
          <Text style={styles.secondaryText}>Pause</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.btn, styles.ghost, !canStop && styles.disabled]}
        onPress={onStop}
        disabled={!canStop}
        accessibilityRole="button"
        accessibilityLabel="Stop and reset"
      >
        <Text style={styles.ghostText}>Stop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryText: {
    color: '#141612',
    fontSize: 17,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.35,
  },
});
