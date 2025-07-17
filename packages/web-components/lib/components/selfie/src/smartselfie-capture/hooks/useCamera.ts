import { useRef, useState } from 'preact/hooks';

export const useCamera = (initialFacingMode: CameraFacingMode = 'user') => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState(initialFacingMode);
  const [agentSupported, setAgentSupported] = useState(false);
  const onCameraSwitchCallbackRef = useRef<(() => void) | null>(null);
  const isSwitchingCameraRef = useRef(false);

  const registerCameraSwitchCallback = (callback: () => void) => {
    onCameraSwitchCallbackRef.current = callback;
  };

  const startCamera = async (
    targetFacingMode?: CameraFacingMode,
    callback?: (cameraName?: string) => void,
  ) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacingMode || facingMode },
      });
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const actualFacingMode = settings.facingMode as
        | CameraFacingMode
        | undefined;

      const requestedFacingMode = targetFacingMode || facingMode;

      if (actualFacingMode && actualFacingMode !== requestedFacingMode) {
        setFacingMode(actualFacingMode);
      } else if (actualFacingMode && actualFacingMode !== facingMode) {
        setFacingMode(actualFacingMode);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find(
        (device) =>
          device.kind === 'videoinput' &&
          stream.getVideoTracks()[0].getSettings().deviceId === device.deviceId,
      );

      callback?.(videoDevice?.label);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (isSwitchingCameraRef.current && onCameraSwitchCallbackRef.current) {
          // wait for video to be ready and call callback
          const video = videoRef.current;
          const triggerCallback = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setTimeout(() => {
                onCameraSwitchCallbackRef.current?.();
                isSwitchingCameraRef.current = false;
              }, 100);
            } else {
              // if not ready, wait for loadedmetadata
              const handleReady = () => {
                video.removeEventListener('loadedmetadata', handleReady);
                setTimeout(() => {
                  onCameraSwitchCallbackRef.current?.();
                  isSwitchingCameraRef.current = false;
                }, 100);
              };
              video.addEventListener('loadedmetadata', handleReady);
            }
          };

          setTimeout(triggerCallback, 50);
        }
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    isSwitchingCameraRef.current = true;

    const previousFacingMode = facingMode;
    try {
      setFacingMode(newFacingMode);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      await startCamera(newFacingMode);
    } catch (error) {
      setFacingMode(previousFacingMode);
      isSwitchingCameraRef.current = false;

      try {
        await startCamera(previousFacingMode);
      } catch (restoreError) {
        console.error('Failed to restore previous camera:', restoreError);
      }
    }
  };

  const detectBrowserEngine = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    const isGecko =
      userAgent.includes('firefox') ||
      (userAgent.includes('gecko') &&
        !userAgent.includes('chrome') &&
        !userAgent.includes('edge'));

    const hasFirefoxFeatures =
      'mozInnerScreenX' in window ||
      'mozInputSource' in window ||
      'mozPaintCount' in window ||
      typeof (window as any).InstallTrigger !== 'undefined';

    const supportsMozCSS =
      CSS.supports &&
      (CSS.supports('-moz-appearance', 'none') ||
        CSS.supports('-moz-user-select', 'none'));

    return {
      isGecko: isGecko || hasFirefoxFeatures || supportsMozCSS,
      isChromium:
        userAgent.includes('chrome') ||
        userAgent.includes('chromium') ||
        userAgent.includes('edge'),
      isWebKit: userAgent.includes('webkit') && !userAgent.includes('chrome'),
    };
  };

  const checkAgentSupport = async () => {
    try {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

      // mobile devices generally support both cameras
      // also, ios crashes if we try to check for cameras
      if (isMobile) {
        setAgentSupported(true);
        return;
      }

      const { isGecko } = detectBrowserEngine();

      let hasUserCamera = false;
      let hasEnvironmentCamera = false;

      // test if we can get a user-facing camera
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        hasUserCamera = true;
        userStream.getTracks().forEach((track) => track.stop()); // Clean up
      } catch (error) {
        // no user-facing camera available
      }

      // test if we can get an environment-facing camera
      try {
        const envStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        hasEnvironmentCamera = true;
        envStream.getTracks().forEach((track) => track.stop()); // Clean up
      } catch (error) {
        // no environment-facing camera available
      }

      const hasBothCameras = hasUserCamera && hasEnvironmentCamera;

      if (!hasBothCameras) {
        setAgentSupported(false);
        return;
      }

      setAgentSupported(!isGecko);
    } catch (error) {
      setAgentSupported(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
  };

  return {
    videoRef,
    streamRef,
    facingMode,
    agentSupported,
    startCamera,
    switchCamera,
    checkAgentSupport,
    stopCamera,
    registerCameraSwitchCallback,
  };
};
