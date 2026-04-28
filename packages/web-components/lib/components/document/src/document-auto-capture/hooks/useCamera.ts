// @ts-nocheck
// TODO(document-auto-capture): port to strict TypeScript.
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Acquire and manage the rear-facing camera stream for document capture.
 * Mirrors the id-scanner implementation: tries progressively relaxed
 * constraints (1920×1080 → environment-only → any video) so older devices
 * still get a usable stream.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        const constraintsList = [
          {
            audio: false,
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          {
            audio: false,
            video: { facingMode: 'environment' },
          },
          {
            audio: false,
            video: true,
          },
        ];

        let mediaStream = null;
        for (const constraints of constraintsList) {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (e) {
            console.warn('Constraint failed, trying next:', e.message);
          }
        }

        if (!mediaStream) throw new Error('All camera constraints failed');

        const track = mediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log(
          `Camera active: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`,
        );

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        setStream(mediaStream);
        currentStream = mediaStream;
      } catch (err) {
        console.error('Camera access failed:', err);
        setError('Camera access denied or unavailable.');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, error, stream };
}
