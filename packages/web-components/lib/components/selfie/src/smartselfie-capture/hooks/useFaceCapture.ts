import { useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
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
import packageJson from '../../../../../../package.json';

const COMPONENTS_VERSION = packageJson.version;

interface UseFaceCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mediapipeInstance?: FaceLandmarker;
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
  mediapipeInstance,
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

  const initializeFaceLandmarker = async () => {
    if (mediapipeInstance) {
      faceLandmarkerRef.current = mediapipeInstance;
      return;
    }
    const vision = await FilesetResolver.forVisionTasks(
      'https://web-models.smileidentity.com/mediapipe-tasks-vision-wasm',
    );

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://web-models.smileidentity.com/face_landmarker/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 2,
    });
  };

  const updateAlert = (messageKey: MessageKey | null) => {
    if (messageKey && MESSAGES[messageKey]) {
      alertTitle.value = MESSAGES[messageKey];
    } else {
      alertTitle.value = '';
    }
  };

  const setupCanvas = () => {
    if (videoRef.current && canvasRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;

      videoAspectRatio.value = videoWidth / videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const container = videoRef.current.parentElement;
      if (container) {
        canvasRef.current.style.left = '50%';
        canvasRef.current.style.top = '50%';
        canvasRef.current.style.transform = 'translate(-50%, -50%) scaleX(-1)';
      }
    }
  };

  const updateCaptureAlerts = () => {
    const isInNeutralZone = capturesTaken.value < neutralZone.value;
    const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

    if (isInNeutralZone && currentSmileScore.value >= smileThreshold) {
      updateAlert('neutral-expression');
    } else if (isInNeutralZone) {
      alertTitle.value = 'Keep a neutral expression';
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
    if (multipleFaces.value) {
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
    if (!faceLandmarkerRef.current || !videoRef.current) {
      stopDetectionLoop();
      return;
    }

    try {
      const croppedCanvas = createCroppedVideoFrame(videoRef.current);
      const detectionSource = croppedCanvas || videoRef.current;

      const results = faceLandmarkerRef.current.detectForVideo(
        detectionSource,
        performance.now(),
      );

      faceLandmarks.value = results.faceLandmarks || [];

      if (results.faceLandmarks && canvasRef.current && videoRef.current) {
        // we run detection on a cropped video frame
        // adjust landmark coordinates back to full video space
        if (croppedCanvas) {
          const sourceWidth = videoRef.current.videoWidth;
          const sourceHeight = videoRef.current.videoHeight;
          const squareSize = Math.min(sourceWidth, sourceHeight);
          const offsetX = (sourceWidth - squareSize) / (2 * sourceWidth);
          const offsetY = (sourceHeight - squareSize) / (2 * sourceHeight);
          const scaleFactor = squareSize / sourceWidth;
          const scaleFactorY = squareSize / sourceHeight;

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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
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
  };
};
