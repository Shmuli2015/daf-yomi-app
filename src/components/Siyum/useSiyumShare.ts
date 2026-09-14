import { useCallback, useEffect, useRef, useState } from 'react';
import type { View } from 'react-native';
import { captureAndShare, waitForShareCaptureReady } from '../../utils/shareProgressImage';

export function useSiyumShare(visible: boolean) {
  const captureRef = useRef<View>(null);
  const [sharingImage, setSharingImage] = useState(false);
  const [captureLaidOut, setCaptureLaidOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setCaptureLaidOut(false);
    } else {
      setSharingImage(false);
      setCaptureLaidOut(false);
    }
  }, [visible]);

  const handleShareImage = useCallback(async () => {
    if (sharingImage) return;
    setSharingImage(true);
    try {
      await waitForShareCaptureReady(captureLaidOut);
      await captureAndShare(captureRef);
    } finally {
      setSharingImage(false);
    }
  }, [captureLaidOut, sharingImage]);

  const onCaptureLayout = useCallback(() => {
    setCaptureLaidOut(true);
  }, []);

  return {
    captureRef,
    sharingImage,
    handleShareImage,
    onCaptureLayout,
  };
}
