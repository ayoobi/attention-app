import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import { ALERT_VIBRATION_PATTERN } from '../constants';

/**
 * Strong repeating vibration + looping alert while `active`.
 * Sound file: assets/alert.wav (short beep).
 */
export function useDistractionAlerts(active: boolean) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/alert.wav'),
          { isLooping: true, volume: 1.0, shouldPlay: true }
        );
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch {
        // Missing asset or audio session — vibration still runs.
      }

      if (Platform.OS === 'android') {
        Vibration.vibrate([...ALERT_VIBRATION_PATTERN], true);
      } else {
        const pulse = () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
            () => undefined
          );
        };
        pulse();
        const id = setInterval(pulse, 900);
        return () => clearInterval(id);
      }
    }

    function stop() {
      Vibration.cancel();
      const sound = soundRef.current;
      soundRef.current = null;
      if (sound) {
        sound.stopAsync().finally(() => sound.unloadAsync().catch(() => undefined));
      }
    }

    let clearIos: (() => void) | undefined;
    if (active) {
      start().then((cleanup) => {
        if (typeof cleanup === 'function') clearIos = cleanup;
      });
    } else {
      stop();
    }

    return () => {
      cancelled = true;
      clearIos?.();
      stop();
    };
  }, [active]);
}
