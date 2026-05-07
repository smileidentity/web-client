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

        // Sequential fallback: try each constraint set; only attempt the next
        // if the previous one rejects. Implemented via a reduce-driven promise
        // chain so we avoid `for...of` + `await-in-loop` lint rules.
        const INITIAL = new Error('__initial__');
        const mediaStream = await constraintsList.reduce<Promise<MediaStream>>(
          (prev, constraints) =>
            prev.catch((e: Error) => {
              if (e !== INITIAL)
                console.warn('Constraint failed, trying next:', e.message);
              return navigator.mediaDevices.getUserMedia(constraints);
            }),
          Promise.reject(INITIAL),
        );

        if (!mediaStream) throw new Error('All camera constraints failed');

        const track = mediaStream.getVideoTracks()[0];

        // Best-effort continuous autofocus / exposure / white balance.
        // Laptop webcams in particular benefit from this — many ship with
        // continuous AF available but not enabled by default. Each constraint
        // is applied independently so an unsupported one doesn't kill the
        // others.
        const tryApply = async (constraint: MediaTrackConstraints) => {
          try {
            await track.applyConstraints(constraint);
          } catch {
            /* unsupported, ignore */
          }
        };
        await tryApply({
          advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
        });
        // await tryApply({ advanced: [{ exposureMode: 'continuous' } as MediaTrackConstraintSet] });
        // await tryApply({ advanced: [{ whiteBalanceMode: 'continuous' } as MediaTrackConstraintSet] });

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
