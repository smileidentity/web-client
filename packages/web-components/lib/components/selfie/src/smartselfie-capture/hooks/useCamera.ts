import { useRef, useState } from 'preact/hooks';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [agentSupported, setAgentSupported] = useState(false);
  const onCameraSwitchCallbackRef = useRef<(() => void) | null>(null);
  const isSwitchingCameraRef = useRef(false);

  const registerCameraSwitchCallback = (callback: () => void) => {
    onCameraSwitchCallbackRef.current = callback;
  };

  const startCamera = async (targetFacingMode?: 'user' | 'environment') => {
    try {
      // eslint-disable-next-line no-console
      console.log(
        '[Camera] Starting camera with facingMode:',
        targetFacingMode || facingMode,
      );
      // eslint-disable-next-line no-console
      console.log('[Camera] Current streamRef:', !!streamRef.current);
      // eslint-disable-next-line no-console
      console.log('[Camera] Current videoRef:', !!videoRef.current);

      if (streamRef.current) {
        // eslint-disable-next-line no-console
        console.log('[Camera] Stopping existing stream');
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        // eslint-disable-next-line no-console
        console.log('[Camera] Clearing video srcObject');
        videoRef.current.srcObject = null;
      }

      // eslint-disable-next-line no-console
      console.log('[Camera] Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacingMode || facingMode },
      });
      // eslint-disable-next-line no-console
      console.log('[Camera] getUserMedia successful, stream:', stream);
      streamRef.current = stream;

      // Detect actual facing mode from the stream
      const track = stream.getVideoTracks()[0];
      // eslint-disable-next-line no-console
      console.log('[Camera] Video track:', track);
      const settings = track.getSettings();
      // eslint-disable-next-line no-console
      console.log('[Camera] Track settings:', settings);
      const actualFacingMode = settings.facingMode as
        | 'user'
        | 'environment'
        | undefined;

      // Update our state to match actual camera
      if (actualFacingMode && actualFacingMode !== facingMode) {
        // eslint-disable-next-line no-console
        console.log(
          '[Camera] Updating facingMode from',
          facingMode,
          'to',
          actualFacingMode,
        );
        setFacingMode(actualFacingMode);
      }

      // eslint-disable-next-line no-console
      console.log('[Camera] Enumerating devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find(
        (device) =>
          device.kind === 'videoinput' &&
          stream.getVideoTracks()[0].getSettings().deviceId === device.deviceId,
      );
      // eslint-disable-next-line no-console
      console.log('[Camera] Found video device:', videoDevice?.label);

      const smartCameraWeb = document.querySelector('smart-camera-web');
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.camera-name', {
          detail: { cameraName: videoDevice?.label },
        }),
      );

      if (videoRef.current) {
        // eslint-disable-next-line no-console
        console.log('[Camera] Setting video srcObject and playing...');

        const video = videoRef.current;
        video.srcObject = stream;

        // eslint-disable-next-line no-console
        console.log('[Camera] Applying universal video settings...');

        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true'); // legacy iOS support
        video.muted = true;
        video.autoplay = true;

        video.load();

        const waitForMetadata = () =>
          new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video metadata timeout'));
            }, 10000);

            const onLoadedMetadata = () => {
              clearTimeout(timeout);
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              // eslint-disable-next-line no-console
              console.log(
                '[Camera] Video metadata loaded, dimensions:',
                video.videoWidth,
                'x',
                video.videoHeight,
              );
              resolve();
            };

            if (video.readyState >= 1) {
              clearTimeout(timeout);
              resolve();
            } else {
              video.addEventListener('loadedmetadata', onLoadedMetadata);
            }
          });

        await waitForMetadata();

        await video.play();
        // eslint-disable-next-line no-console
        console.log(
          '[Camera] Video is playing, dimensions:',
          video.videoWidth,
          'x',
          video.videoHeight,
          'readyState:',
          video.readyState,
        );

        if (isSwitchingCameraRef.current && onCameraSwitchCallbackRef.current) {
          // wait for video to be ready and call callback
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
      // eslint-disable-next-line no-console
      console.log('[Camera] ✅ Camera started successfully');
    } catch (error) {
      console.error('[Camera] ❌ Failed to start camera:', error);
      console.error('[Camera] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
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

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown camera switch error';
      window.dispatchEvent(
        new CustomEvent('camera-switch-failed', {
          detail: { error: errorMessage },
        }),
      );
    }
  };

  const detectBrowserEngine = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    // eslint-disable-next-line no-console
    console.log('[Camera] Detecting browser engine for User Agent:', userAgent);

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

    const result = {
      isGecko: isGecko || hasFirefoxFeatures || supportsMozCSS,
      isChromium:
        userAgent.includes('chrome') ||
        userAgent.includes('chromium') ||
        userAgent.includes('edge'),
      isWebKit: userAgent.includes('webkit') && !userAgent.includes('chrome'),
    };

    // eslint-disable-next-line no-console
    console.log('[Camera] Browser detection result:', result);
    return result;
  };

  const checkAgentSupport = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[Camera] Checking agent support...');

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

      // eslint-disable-next-line no-console
      console.log('[Camera] Is mobile device:', isMobile);
      // eslint-disable-next-line no-console
      console.log('[Camera] Max touch points:', navigator.maxTouchPoints);

      const { isGecko } = detectBrowserEngine();
      // eslint-disable-next-line no-console
      console.log('[Camera] Is Gecko browser:', isGecko);

      let hasUserCamera = false;
      let hasEnvironmentCamera = false;

      // test if we can get a user-facing camera
      try {
        // eslint-disable-next-line no-console
        console.log('[Camera] Testing user-facing camera...');
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        hasUserCamera = true;
        // eslint-disable-next-line no-console
        console.log('[Camera] ✅ User-facing camera available');
        userStream.getTracks().forEach((track) => track.stop()); // Clean up
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('[Camera] ❌ User-facing camera not available:', error);
      }

      // test if we can get an environment-facing camera
      try {
        // eslint-disable-next-line no-console
        console.log('[Camera] Testing environment-facing camera...');
        const envStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        hasEnvironmentCamera = true;
        // eslint-disable-next-line no-console
        console.log('[Camera] ✅ Environment-facing camera available');
        envStream.getTracks().forEach((track) => track.stop()); // Clean up
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(
          '[Camera] ❌ Environment-facing camera not available:',
          error,
        );
      }

      const hasBothCameras = hasUserCamera && hasEnvironmentCamera;
      // eslint-disable-next-line no-console
      console.log('[Camera] Has both cameras:', hasBothCameras);

      if (!hasBothCameras) {
        // eslint-disable-next-line no-console
        console.log('[Camera] Agent mode NOT supported - missing cameras');
        setAgentSupported(false);
        return;
      }

      if (isMobile) {
        // eslint-disable-next-line no-console
        console.log(
          '[Camera] Agent mode supported - mobile device with both cameras',
        );
        setAgentSupported(true);
        return;
      }

      const finalAgentSupported = !isGecko;
      // eslint-disable-next-line no-console
      console.log(
        '[Camera] Agent mode supported (desktop):',
        finalAgentSupported,
        '(not Gecko:',
        !isGecko,
        ')',
      );
      setAgentSupported(finalAgentSupported);
    } catch (error) {
      console.error('[Camera] ❌ Error checking agent support:', error);
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
    detectBrowserEngine,
  };
};
