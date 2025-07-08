import { useRef, useState } from 'preact/hooks';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [agentSupported, setAgentSupported] = useState(false);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find(
        (device) =>
          device.kind === 'videoinput' &&
          stream.getVideoTracks()[0].getSettings().deviceId === device.deviceId,
      );

      const smartCameraWeb = document.querySelector('smart-camera-web');
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.camera-name', {
          detail: { cameraName: videoDevice?.label },
        }),
      );

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    await startCamera();
  };

  const checkAgentSupport = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );
      setAgentSupported(videoDevices.length > 1);
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
  };
};
