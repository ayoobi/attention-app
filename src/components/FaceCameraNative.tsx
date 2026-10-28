import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Camera as FaceCamera } from 'react-native-vision-camera-face-detector';
import type { Face } from 'react-native-vision-camera-face-detector';
import { colors, spacing } from '../theme';

type Props = {
  active: boolean;
  onFacePresentChange: (present: boolean) => void;
  onReadyChange: (ready: boolean) => void;
};

/**
 * Rear camera + ML Kit face detection via Vision Camera face-detector plugin.
 * Requires a native build (expo run:android / EAS) — not Expo Go.
 */
export function FaceCameraNative({
  active,
  onFacePresentChange,
  onReadyChange,
}: Props) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const lastPresent = useRef<boolean | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const ready = !!device && hasPermission;
    onReadyChange(ready);
    if (!active || !ready) {
      onFacePresentChange(false);
      lastPresent.current = null;
    }
  }, [device, hasPermission, active, onReadyChange, onFacePresentChange]);

  const handleFaces = (faces: Face[]) => {
    const present = faces.length > 0;
    if (lastPresent.current === present) return;
    lastPresent.current = present;
    onFacePresentChange(present);
  };

  if (!hasPermission) {
    return (
      <View style={styles.wrap}>
        <View style={styles.preview}>
          <Text style={styles.msg}>Camera permission needed for face watch.</Text>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.wrap}>
        <View style={styles.preview}>
          <Text style={styles.msg}>No rear camera found on this device.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.previewClip}>
        <FaceCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={active}
          performanceMode="fast"
          cameraFacing="back"
          onFacesDetected={handleFaces}
          onError={(error) => {
            console.warn('Face detector error', error);
          }}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Rear camera</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  preview: {
    height: 140,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  previewClip: {
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#000',
  },
  msg: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  badgeText: {
    color: colors.text,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
