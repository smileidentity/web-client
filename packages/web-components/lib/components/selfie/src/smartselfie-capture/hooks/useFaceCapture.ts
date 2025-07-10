import { useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import {
  calculateFaceSize,
  isFaceInBounds,
  calculateMouthOpening,
} from '../utils/faceDetection';
import {
  createCroppedVideoFrame,
  drawFaceMesh,
  clearCanvas,
} from '../utils/canvas';
import { captureImageFromVideo } from '../utils/imageCapture';
import { ImageType } from '../constants';
import { MESSAGES, type MessageKey } from '../utils/alertMessages';
import { getMediapipeInstance } from '../utils/mediapipeManager';
import packageJson from '../../../../../../package.json';

const COMPONENTS_VERSION = packageJson.version;

interface UseFaceCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  interval: number;
  duration: number;
  smileThreshold: number;
  mouthOpenThreshold: number;
  minFaceSize: number;
  maxFaceSize: number;
  smileCooldown: number;
}

export const useFaceCapture = ({
  videoRef,
  canvasRef,
  interval,
  duration,
  smileThreshold,
  mouthOpenThreshold,
  minFaceSize,
  maxFaceSize,
  smileCooldown,
}: UseFaceCaptureProps) => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeCaptureRef = useRef<(() => void) | null>(null);

  const faceDetected = useSignal(false);
  const faceInBounds = useSignal(false);
  const faceProximity = useSignal<'too-close' | 'too-far' | 'good'>('good');
  const multipleFaces = useSignal(false);
  const videoAspectRatio = useSignal(16 / 9);
  const faceLandmarks = useSignal<any[]>([]);
  const currentSmileScore = useSignal(0);
  const currentFaceSize = useSignal(0);
  const currentMouthOpen = useSignal(0);
  const lastSmileTime = useSignal(0);
  const alertTitle = useSignal('');
  const isInitializing = useSignal(true);

  const isCapturing = useSignal(false);
  const isPaused = useSignal(false);
  const countdown = useSignal(0);
  const capturedImages = useSignal<string[]>([]);
  const referencePhoto = useSignal<string | null>(null);
  const totalCaptures = useSignal(1);
  const capturesTaken = useSignal(0);
  const hasFinishedCapture = useSignal(false);

  const smileCheckpoint = useComputed(() =>
    Math.floor(totalCaptures.value * 0.4),
  );
  const neutralZone = useComputed(() => Math.floor(totalCaptures.value * 0.2));

  const isReadyToCapture = useComputed(
    () =>
      faceDetected.value &&
      faceInBounds.value &&
      faceProximity.value === 'good' &&
      !multipleFaces.value,
  );

  const updateAlert = (messageKey: MessageKey | null) => {
    if (messageKey && MESSAGES[messageKey]) {
      alertTitle.value = MESSAGES[messageKey];
    } else {
      alertTitle.value = '';
    }
  };

  const initializeFaceLandmarker = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[FaceCapture] Starting MediaPipe initialization...');
      isInitializing.value = true;
      updateAlert('initializing');
      faceLandmarkerRef.current = await getMediapipeInstance();
      // eslint-disable-next-line no-console
      console.log('[FaceCapture] ✅ MediaPipe initialized successfully');
      isInitializing.value = false;
    } catch (error) {
      console.error('[FaceCapture] ❌ Failed to initialize MediaPipe:', error);
      console.error('[FaceCapture] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      isInitializing.value = false;
    }
  };

  const setupCanvas = () => {
    // eslint-disable-next-line no-console
    console.log('[FaceCapture] Setting up canvas...');
    // eslint-disable-next-line no-console
    console.log('[FaceCapture] Video ref:', !!videoRef.current);
    // eslint-disable-next-line no-console
    console.log('[FaceCapture] Canvas ref:', !!canvasRef.current);

    if (videoRef.current && canvasRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      // eslint-disable-next-line no-console
      console.log(
        '[FaceCapture] Video dimensions:',
        videoWidth,
        'x',
        videoHeight,
      );

      if (videoWidth === 0 || videoHeight === 0) {
        // eslint-disable-next-line no-console
        console.warn(
          '[FaceCapture] ⚠️ Video has zero dimensions, waiting for video to load...',
        );

        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log('[FaceCapture] Retrying canvas setup after delay...');
          setupCanvas();
        }, 1000);
        return;
      }

      if (videoWidth > 0 && videoHeight > 0) {
        videoAspectRatio.value = videoWidth / videoHeight;
        // eslint-disable-next-line no-console
        console.log(
          '[FaceCapture] Video aspect ratio:',
          videoAspectRatio.value,
        );

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        // eslint-disable-next-line no-console
        console.log(
          '[FaceCapture] Canvas dimensions set to:',
          canvasRef.current.width,
          'x',
          canvasRef.current.height,
        );

        const container = videoRef.current.parentElement;
        if (container) {
          canvasRef.current.style.left = '50%';
          canvasRef.current.style.top = '50%';
          // eslint-disable-next-line no-console
          console.log('[FaceCapture] Canvas positioned');
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            '[FaceCapture] ⚠️ No parent container found for video element',
          );
        }

        // eslint-disable-next-line no-console
        console.log('[FaceCapture] ✅ Canvas setup completed');
      } else {
        // eslint-disable-next-line no-console
        console.error(
          '[FaceCapture] ❌ Cannot setup canvas - video still has zero dimensions',
        );
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(
        '[FaceCapture] ❌ Cannot setup canvas - missing video or canvas ref',
      );
    }
  };

  const updateCaptureAlerts = () => {
    const isInNeutralZone = capturesTaken.value < neutralZone.value;
    const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

    if (isInNeutralZone && currentSmileScore.value >= smileThreshold) {
      updateAlert('neutral-expression');
    } else if (isInNeutralZone) {
      alertTitle.value = 'Capturing...';
    } else if (isInSmileZone) {
      const timeSinceSmile = Date.now() - lastSmileTime.value;
      if (timeSinceSmile > smileCooldown) {
        if (
          currentSmileScore.value >= smileThreshold &&
          currentMouthOpen.value < mouthOpenThreshold
        ) {
          updateAlert('open-mouth-smile');
        } else {
          updateAlert('smile-required');
        }
      } else {
        alertTitle.value = 'Keep smiling!';
      }
    } else {
      updateAlert(null);
    }
  };

  const updateAlerts = () => {
    if (isInitializing.value) {
      updateAlert('initializing');
    } else if (multipleFaces.value) {
      updateAlert('multiple-faces');
    } else if (!faceDetected.value) {
      updateAlert('no-face');
    } else if (faceProximity.value === 'too-close') {
      updateAlert('too-close');
    } else if (faceProximity.value === 'too-far') {
      updateAlert('too-far');
    } else if (!faceInBounds.value) {
      updateAlert('out-of-bounds');
    } else if (isCapturing.value) {
      updateCaptureAlerts();
    } else {
      alertTitle.value = 'Ready to capture';
    }
  };

  const stopDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const detectFace = async () => {
    const startTime = performance.now();

    if (!faceLandmarkerRef.current || !videoRef.current) {
      // eslint-disable-next-line no-console
      console.log(
        '[FaceCapture] Detection loop stopped - missing landmarker or video',
      );
      stopDetectionLoop();
      return;
    }

    // ensure video has valid dimensions before processing
    if (
      videoRef.current.videoWidth <= 0 ||
      videoRef.current.videoHeight <= 0 ||
      videoRef.current.readyState < 2
    ) {
      const shouldLogVerbose = Math.random() < 0.1;

      if (shouldLogVerbose) {
        // eslint-disable-next-line no-console
        console.log(
          '[FaceCapture] Video not ready - dimensions:',
          videoRef.current.videoWidth,
          'x',
          videoRef.current.videoHeight,
          'readyState:',
          videoRef.current.readyState,
        );
      }

      if (videoRef.current.readyState === 0) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(detectFace);
        }, 100);
      } else {
        animationFrameRef.current = requestAnimationFrame(detectFace);
      }
      return;
    }

    try {
      if (isInitializing.value) {
        // eslint-disable-next-line no-console
        console.log(
          '[FaceCapture] Detection starting - no longer initializing',
        );
        isInitializing.value = false;
      }

      const croppedCanvas = createCroppedVideoFrame(videoRef.current);
      const detectionSource = croppedCanvas || videoRef.current;

      const sourceWidth =
        detectionSource instanceof HTMLVideoElement
          ? detectionSource.videoWidth
          : detectionSource.width;
      const sourceHeight =
        detectionSource instanceof HTMLVideoElement
          ? detectionSource.videoHeight
          : detectionSource.height;

      // Only log detailed info on first few detection runs or if there are issues
      const shouldLogDetails =
        !faceLandmarks.value.length || Math.random() < 0.01;
      if (shouldLogDetails) {
        // eslint-disable-next-line no-console
        console.log(
          '[FaceCapture] Detection source:',
          detectionSource.constructor.name,
          sourceWidth,
          'x',
          sourceHeight,
        );
      }

      const results = faceLandmarkerRef.current.detectForVideo(
        detectionSource,
        performance.now(),
      );

      if (shouldLogDetails) {
        // eslint-disable-next-line no-console
        console.log('[FaceCapture] Detection results:', {
          faceLandmarks: results.faceLandmarks?.length || 0,
          faceBlendshapes: results.faceBlendshapes?.length || 0,
          timestamp: performance.now(),
          processingTime: performance.now() - startTime,
        });
      }

      faceLandmarks.value = results.faceLandmarks || [];

      if (results.faceLandmarks && canvasRef.current && videoRef.current) {
        // we run detection on a cropped video frame
        // adjust landmark coordinates back to full video space
        if (croppedCanvas) {
          const { videoWidth, videoHeight } = videoRef.current;
          const squareSize = Math.min(videoWidth, videoHeight);
          const offsetX = (videoWidth - squareSize) / (2 * videoWidth);
          const offsetY = (videoHeight - squareSize) / (2 * videoHeight);
          const scaleFactor = squareSize / videoWidth;
          const scaleFactorY = squareSize / videoHeight;

          const adjustedLandmarks = results.faceLandmarks.map((face) =>
            face.map((landmark: any) => ({
              x: landmark.x * scaleFactor + offsetX,
              y: landmark.y * scaleFactorY + offsetY,
              z: landmark.z,
            })),
          );

          drawFaceMesh(
            canvasRef.current,
            adjustedLandmarks,
            capturesTaken.value,
            smileCheckpoint.value,
          );
        } else {
          drawFaceMesh(
            canvasRef.current,
            results.faceLandmarks,
            capturesTaken.value,
            smileCheckpoint.value,
          );
        }
      } else if (canvasRef.current) {
        clearCanvas(canvasRef.current);
      }

      // Check number of faces
      const numFaces = results.faceLandmarks ? results.faceLandmarks.length : 0;
      multipleFaces.value = numFaces > 1;

      // Check if face is detected
      const hasFace =
        results.faceBlendshapes &&
        results.faceBlendshapes.length > 0 &&
        numFaces === 1;
      faceDetected.value = hasFace;

      if (hasFace && results.faceLandmarks) {
        // Calculate face size and position
        const faceSize = calculateFaceSize(results.faceLandmarks);
        currentFaceSize.value = faceSize;

        // Check face proximity
        if (faceSize > maxFaceSize) {
          faceProximity.value = 'too-close';
        } else if (faceSize < minFaceSize) {
          faceProximity.value = 'too-far';
        } else {
          faceProximity.value = 'good';
        }

        // Check face position
        faceInBounds.value = isFaceInBounds(
          results.faceLandmarks,
          videoAspectRatio.value,
        );

        // Get smile and mouth open data
        const blendshapes = results.faceBlendshapes[0].categories;
        const smileLeft =
          blendshapes.find((b) => b.categoryName === 'mouthSmileLeft')?.score ||
          0;
        const smileRight =
          blendshapes.find((b) => b.categoryName === 'mouthSmileRight')
            ?.score || 0;
        const mouthOpen = calculateMouthOpening(results.faceLandmarks);
        const smileScore = (smileLeft + smileRight) / 2;

        currentSmileScore.value = smileScore;
        currentMouthOpen.value = mouthOpen;

        if (smileScore >= smileThreshold && mouthOpen >= mouthOpenThreshold) {
          lastSmileTime.value = Date.now();

          if (isPaused.value && isCapturing.value && resumeCaptureRef.current) {
            // defer execution
            setTimeout(() => {
              const stillSmiling = Date.now() - lastSmileTime.value <= 100;
              if (
                stillSmiling &&
                isPaused.value &&
                isCapturing.value &&
                resumeCaptureRef.current
              ) {
                resumeCaptureRef.current();
              }
            }, 0);
          }
        }
      } else {
        // No face detected or multiple faces - reset values
        currentSmileScore.value = 0;
        currentFaceSize.value = 0;
        currentMouthOpen.value = 0;
        faceInBounds.value = false;
        faceProximity.value = 'good';
      }

      updateAlerts();
    } catch (error) {
      console.error('[FaceCapture] ❌ Error during face detection:', error);
      console.error('[FaceCapture] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        videoReady: videoRef.current?.readyState,
        videoDimensions: `${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`,
        faceLandmarkerExists: !!faceLandmarkerRef.current,
      });

      faceDetected.value = false;
      faceInBounds.value = false;
      multipleFaces.value = false;
      faceProximity.value = 'good';
      currentMouthOpen.value = 0;

      if (isCapturing.value) {
        updateAlert('no-face');
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  const startDetectionLoop = () => {
    // eslint-disable-next-line no-console
    console.log('[FaceCapture] Starting detection loop...');
    // eslint-disable-next-line no-console
    console.log(
      '[FaceCapture] FaceLandmarker available:',
      !!faceLandmarkerRef.current,
    );
    // eslint-disable-next-line no-console
    console.log('[FaceCapture] Video available:', !!videoRef.current);

    if (animationFrameRef.current) {
      // eslint-disable-next-line no-console
      console.log('[FaceCapture] Cancelling existing animation frame');
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (!faceLandmarkerRef.current) {
      // eslint-disable-next-line no-console
      console.error(
        '[FaceCapture] ❌ Cannot start detection loop - no FaceLandmarker instance',
      );
      return;
    }

    if (!videoRef.current) {
      // eslint-disable-next-line no-console
      console.error(
        '[FaceCapture] ❌ Cannot start detection loop - no video element',
      );
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[FaceCapture] ✅ Starting detection loop animation frame');
    animationFrameRef.current = requestAnimationFrame(detectFace);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const isReference = capturesTaken.value === totalCaptures.value - 1;
    const imageData = captureImageFromVideo(videoRef.current, isReference);

    if (!imageData) return;

    if (isReference) {
      referencePhoto.value = imageData;
    } else {
      capturedImages.value = [...capturedImages.value, imageData];
    }

    capturesTaken.value++;
    countdown.value = totalCaptures.value - capturesTaken.value;
  };

  const stopCapture = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    isCapturing.value = false;
    isPaused.value = false;

    if (capturesTaken.value >= totalCaptures.value && referencePhoto.value) {
      const livenessImages = capturedImages.value.map((img) => ({
        image: img.split(',')[1],
        image_type_id: ImageType.LIVENESS_IMAGE_BASE64,
      }));

      const referenceImage = {
        image: referencePhoto.value.split(',')[1],
        image_type_id: ImageType.SELFIE_IMAGE_BASE64,
      };

      const eventDetail = {
        images: [...livenessImages, referenceImage],
        referenceImage: referencePhoto.value,
        previewImage: referencePhoto.value,
        meta: { libraryVersion: COMPONENTS_VERSION },
      };

      window.dispatchEvent(
        new CustomEvent('selfie-capture.publish', {
          detail: eventDetail,
        }),
      );

      const smartCameraWeb = document.querySelector('smart-camera-web');
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );

      hasFinishedCapture.value = true;
    }
  };

  const pauseCapture = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    isPaused.value = true;

    if (
      !multipleFaces.value &&
      faceDetected.value &&
      faceInBounds.value &&
      faceProximity.value === 'good'
    ) {
      updateAlert('smile-required');
    }
  };

  const startCaptureInterval = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
    }

    captureTimerRef.current = setInterval(() => {
      if (capturesTaken.value >= totalCaptures.value) {
        stopCapture();
        return;
      }

      if (multipleFaces.value) {
        pauseCapture();
        return;
      }

      if (!faceDetected.value) {
        return;
      }

      if (!faceInBounds.value) {
        pauseCapture();
        return;
      }

      if (faceProximity.value !== 'good') {
        pauseCapture();
        return;
      }

      const isInNeutralZone = capturesTaken.value < neutralZone.value;
      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

      if (isInNeutralZone && currentSmileScore.value >= smileThreshold) {
        return;
      }

      if (isInSmileZone) {
        const timeSinceSmile = Date.now() - lastSmileTime.value;
        if (timeSinceSmile > smileCooldown) {
          pauseCapture();
          return;
        }
      }

      captureImage();
    }, interval);
  };

  const resumeCapture = () => {
    if (
      faceDetected.value &&
      faceProximity.value === 'good' &&
      faceInBounds.value &&
      !multipleFaces.value
    ) {
      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;
      if (isInSmileZone) {
        const timeSinceSmile = Date.now() - lastSmileTime.value;
        if (timeSinceSmile > smileCooldown) {
          return;
        }
      }

      isPaused.value = false;
      updateAlert(null);
      startCaptureInterval();
    }
  };

  resumeCaptureRef.current = resumeCapture;

  const startCapture = async () => {
    capturedImages.value = [];
    isCapturing.value = true;
    isPaused.value = false;
    totalCaptures.value = Math.ceil(duration / interval);
    capturesTaken.value = 0;
    countdown.value = totalCaptures.value;

    startCaptureInterval();
  };

  const handleCancel = () => {
    stopCapture();
    window.dispatchEvent(
      new CustomEvent('selfie-capture.cancelled', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );

    // TODO: remove - for backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.cancelled', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  const handleClose = () => {
    stopCapture();

    window.dispatchEvent(
      new CustomEvent('selfie-capture.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );

    // TODO: remove - backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  const cleanup = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
    }
    stopDetectionLoop();
  };

  const resetFaceDetectionState = () => {
    faceDetected.value = false;
    faceInBounds.value = false;
    faceProximity.value = 'good';
    multipleFaces.value = false;
    faceLandmarks.value = [];
    currentSmileScore.value = 0;
    currentFaceSize.value = 0;
    currentMouthOpen.value = 0;
    lastSmileTime.value = 0;

    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  };

  return {
    faceDetected,
    faceInBounds,
    faceProximity,
    multipleFaces,
    videoAspectRatio,
    faceLandmarks,
    currentSmileScore,
    currentFaceSize,
    currentMouthOpen,
    lastSmileTime,
    alertTitle,
    isInitializing,
    isReadyToCapture,

    isCapturing,
    isPaused,
    countdown,
    capturedImages,
    referencePhoto,
    totalCaptures,
    capturesTaken,
    hasFinishedCapture,
    smileCheckpoint,
    neutralZone,

    initializeFaceLandmarker,
    setupCanvas,
    startDetectionLoop,
    stopDetectionLoop,
    updateAlert,
    startCapture,
    stopCapture,
    pauseCapture,
    resumeCapture,
    handleCancel,
    handleClose,
    cleanup,
    resetFaceDetectionState,
  };
};
