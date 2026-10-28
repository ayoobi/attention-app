import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DURATION_PRESETS_MIN } from '../constants';
import { colors, spacing } from '../theme';

type Props = {
  durationMs: number;
  disabled?: boolean;
  onSelectMinutes: (minutes: number) => void;
};

export function DurationPicker({ durationMs, disabled, onSelectMinutes }: Props) {
  const selectedMin = Math.round(durationMs / 60_000);

  return (
    <View style={styles.row}>
      {DURATION_PRESETS_MIN.map((min) => {
        const selected = selectedMin === min;
        return (
          <Pressable
            key={min}
            disabled={disabled}
            onPress={() => onSelectMinutes(min)}
            style={[
              styles.chip,
              selected && styles.chipSelected,
              disabled && styles.chipDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: !!disabled }}
            accessibilityLabel={`${min} minutes`}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {min}m
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    minWidth: 56,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.bgSoft,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.text,
  },
});
