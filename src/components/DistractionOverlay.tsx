import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  visible: boolean;
};

export function DistractionOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none">
      <Text style={styles.title}>Put the phone back</Text>
      <Text style={styles.body}>
        The rear camera needs to see your face again. Place the phone beside or
        behind your laptop, face the screen, and the timer will resume.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(26, 28, 25, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 20,
  },
  title: {
    color: colors.warn,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
});
