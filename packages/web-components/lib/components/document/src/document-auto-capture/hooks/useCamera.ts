import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Acquire and manage the rear-facing camera stream for document capture.
 * Mirrors the id-scanner implementation: tries progressively relaxed
 * constraints (1920×1080 → environment-only → any video) so older devices
 * still get a usable stream.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const constraintsList: MediaStreamConstraints[] = [
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
        // if the previous one rejects. Implemented as a small recursive helper
        // so we avoid both `await`-in-loop and the contrived reduce/Promise
        // chain that the previous version used.
        const tryConstraints = (index: number): Promise<MediaStream> => {
          if (index >= constraintsList.length) {
            return Promise.reject(new Error('All camera constraints failed'));
          }
          return navigator.mediaDevices
            .getUserMedia(constraintsList[index])
            .catch((e: Error) => {
              console.warn(
                'Camera constraint failed, trying next:',
                e?.message,
              );
              return tryConstraints(index + 1);
            });
        };

        const mediaStream = await tryConstraints(0);

        // The component may have unmounted while getUserMedia was pending; if
        // so, stop the freshly-acquired stream immediately so we don't leak the
        // camera (the cleanup below ran before currentStream was assigned).
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

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
      cancelled = true;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { videoRef, error, stream };
}
