import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  active: boolean;
  facePresent: boolean;
  onFacePresentChange: (present: boolean) => void;
  onReadyChange: (ready: boolean) => void;
};

/** Expo Go / UI-only path — toggle simulates rear-camera face presence. */
export function FaceCameraMock({
  active,
  facePresent,
  onFacePresentChange,
  onReadyChange,
}: Props) {
  useEffect(() => {
    onReadyChange(true);
  }, [onReadyChange]);

  useEffect(() => {
    // Default to "facing computer" when a mock session starts.
    onFacePresentChange(active);
  }, [active, onFacePresentChange]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.preview, !active && styles.previewIdle]}>
        <Text style={styles.previewLabel}>
          {active
            ? facePresent
              ? 'Mock: face present'
              : 'Mock: face lost'
            : 'Camera idle'}
        </Text>
      </View>
      {active ? (
        <Pressable
          style={styles.toggle}
          onPress={() => onFacePresentChange(!facePresent)}
          accessibilityRole="button"
          accessibilityLabel="Toggle simulated face detection"
        >
          <Text style={styles.toggleText}>
            {facePresent ? 'Simulate phone pickup' : 'Simulate face returned'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  preview: {
    height: 120,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIdle: {
    borderColor: colors.border,
    opacity: 0.7,
  },
  previewLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  toggle: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
