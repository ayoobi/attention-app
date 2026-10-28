import Constants from 'expo-constants';
import { FaceCameraMock } from './FaceCameraMock';

type Props = {
  active: boolean;
  facePresent: boolean;
  onFacePresentChange: (present: boolean) => void;
  onReadyChange: (ready: boolean) => void;
};

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Picks native rear-camera face detection when running in a dev/production
 * build; falls back to a mock toggle in Expo Go so the timer UI remains usable.
 */
export function FaceMonitor(props: Props) {
  if (isExpoGo()) {
    return <FaceCameraMock {...props} />;
  }

  // Lazy require so Expo Go never evaluates Vision Camera native entry.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FaceCameraNative } = require('./FaceCameraNative') as typeof import('./FaceCameraNative');
  return <FaceCameraNative {...props} />;
}

export function usesMockFaceMonitor(): boolean {
  return isExpoGo();
}
