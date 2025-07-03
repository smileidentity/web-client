import { useRef, useEffect, useState } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import register from 'preact-custom-element';
import type { FunctionComponent } from 'preact';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import OvalProgress from './OvalProgress';
import packageJson from '../../../../../package.json';
import { ImageType } from './constants';
import '../../../navigation/src';
import '../../../attribution/PoweredBySmileId';

interface Props {
  interval?: number;
  duration?: number;
  'theme-color'?: string;
  'show-navigation'?: string | boolean;
  'allow-agent-mode'?: string | boolean;
  'show-agent-mode-for-tests'?: string | boolean;
  'hide-attribution'?: string | boolean;
  'disable-image-tests'?: string | boolean;
  mediapipeInstance?: FaceLandmarker;
}

// Face mesh landmark indices for key features
const FACE_OUTLINE = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];
// const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const MOUTH_OUTER = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37,
  39, 40, 185,
];
const MOUTH_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87,
  178, 88, 95,
];

const MESSAGES = {
  'multiple-faces': "Ensure only one face is visible",
  'no-face': "Position your face in the oval",
  'out-of-bounds': "Position your face in the oval",
  'too-close': "Move farther away",
  'too-far': "Move closer",
  'neutral-expression': "Neutral expression",
  'smile-required': "Smile!",
  'open-mouth-smile': 'Bigger smile!'
};

const smartCameraWeb = document.querySelector('smart-camera-web');
const COMPONENTS_VERSION = packageJson.version;

const SelfieBooth: FunctionComponent<Props> = ({
  interval = 350,
  duration = 2800,
  'theme-color': themeColor = '#001096',
  'show-navigation': showNavigationProp = false,
  'allow-agent-mode': allowAgentModeProp = false,
  'show-agent-mode-for-tests': showAgentModeForTestsProp = false,
  'hide-attribution': hideAttributionProp = false,
  mediapipeInstance,
}) => {
  // Convert string attributes to boolean
  const showNavigation =
    showNavigationProp === true ||
    showNavigationProp === 'true' ||
    showNavigationProp === '';
  const allowAgentMode =
    allowAgentModeProp === true || allowAgentModeProp === 'true';
  const showAgentModeForTests =
    showAgentModeForTestsProp === true ||
    showAgentModeForTestsProp === 'true' ||
    showAgentModeForTestsProp === '';
  const hideAttribution =
    hideAttributionProp === true ||
    hideAttributionProp === 'true' ||
    hideAttributionProp === '';

  const isCapturing = useSignal(false);
  const isPaused = useSignal(false);
  const countdown = useSignal(0);
  const alertTitle = useSignal('');
  const capturedImages = useSignal<string[]>([]);
  const referencePhoto = useSignal<string | null>(null);
  const lastSmileTime = useSignal(0);
  const faceDetected = useSignal(false);
  const faceInBounds = useSignal(false);
  const faceProximity = useSignal<'too-close' | 'too-far' | 'good'>('good');
  const multipleFaces = useSignal(false);
  const videoAspectRatio = useSignal(16 / 9);
  const faceLandmarks = useSignal<any[]>([]);
  const totalCaptures = useSignal(1);
  const capturesTaken = useSignal(0);
  const currentSmileScore = useSignal(0);
  const currentFaceSize = useSignal(0);
  const currentMouthOpen = useSignal(0);
  const smileCheckpoint = useComputed(() =>
    Math.floor(totalCaptures.value * 0.4),
  );
  const neutralZone = useComputed(() => Math.floor(totalCaptures.value * 0.2));
  const hasFinishedCapture = useSignal(false);
  const isReadyToCapture = useComputed(() => 
    faceDetected.value && 
    faceInBounds.value && 
    faceProximity.value === 'good' && 
    !multipleFaces.value
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const navigationRef = useRef<HTMLElement | null>(null);

  // Agent mode
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [agentSupported, setAgentSupported] = useState(false);

  const smileCooldown = 300;
  const smileThreshold = 0.2;
  const mouthOpenThreshold = 0.05;
  const minFaceSize = 0.3;
  const maxFaceSize = 0.5;

  const initializeFaceLandmarker = async () => {
    // If a Mediapipe instance was passed as a prop, use it
    if (mediapipeInstance) {
      faceLandmarkerRef.current = mediapipeInstance;
      return;
    }

    // Otherwise, load Mediapipe ourselves (for backward compatibility)
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
    );

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 5,
    });
  };
  const startCamera = async () => {
    try {
      // Ensure any existing stream is stopped before starting new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear video element source
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
      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.camera-name', {
          detail: { cameraName: videoDevice?.label },
        }),
      );

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Mark video as ready

        // Function to set up canvas when video is ready
        const setupCanvas = () => {
          if (videoRef.current && canvasRef.current) {
            // Get the video's intrinsic dimensions
            const { videoWidth, videoHeight } = videoRef.current;

            videoAspectRatio.value = videoWidth / videoHeight;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const container = videoRef.current.parentElement;
            if (container) {
              canvasRef.current.style.left = '50%';
              canvasRef.current.style.top = '50%';
              canvasRef.current.style.transform =
                'translate(-50%, -50%) scaleX(-1)';
            }
          } else {
            setTimeout(setupCanvas, 50);
          }
        };

        // Wait for video to play first, then setup canvas
        await videoRef.current.play();

        // Give React a chance to render the canvas element
        setTimeout(() => {
          if (
            videoRef.current &&
            (videoRef.current.readyState >= 1 ||
              videoRef.current.videoWidth > 0)
          ) {
            setupCanvas();
          } else {
            videoRef.current?.addEventListener('loadedmetadata', setupCanvas, {
              once: true,
            });
          }
        }, 100);
      }
    } catch {
      // do nothing
    }
  };

  const drawFaceMesh = (landmarks: any[]) => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Scale line width based on canvas resolution, not display size
    const scaleFactor = Math.sqrt(canvasWidth * canvasHeight) / 500;

    landmarks.forEach((landmark) => {
      if (!landmark || landmark.length === 0) return;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = Math.max(1, 2 * scaleFactor);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Helper function to draw connected points
      const drawConnectedPoints = (
        points: number[],
        closed: boolean = false,
      ) => {
        if (points.length < 2) return;

        ctx.beginPath();
        const firstPoint = landmark[points[0]];
        if (!firstPoint) return;

        ctx.moveTo(firstPoint.x * canvasWidth, firstPoint.y * canvasHeight);

        for (let i = 1; i < points.length; i++) {
          const point = landmark[points[i]];
          if (point) {
            ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight);
          }
        }

        if (closed && points.length > 2) {
          ctx.closePath();
        }

        ctx.stroke();
      };

      // Helper function to draw individual points
      // const drawPoints = (points: number[], radius: number = 1) => {
      //   points.forEach((pointIndex) => {
      //     const point = faceLandmarks[pointIndex];
      //     if (point) {
      //       ctx.beginPath();
      //       ctx.arc(point.x * canvasWidth, point.y * canvasHeight, radius * scaleFactor, 0, 2 * Math.PI);
      //       ctx.fill();
      //     }
      //   });
      // };

      // Draw face outline
      drawConnectedPoints(FACE_OUTLINE, true);

      // Draw eyes
      // drawConnectedPoints(LEFT_EYE, true);
      // drawConnectedPoints(RIGHT_EYE, true);

      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;
      // Draw mouth
      if (isInSmileZone) {
        drawConnectedPoints(MOUTH_OUTER, true);
        drawConnectedPoints(MOUTH_INNER, true);
      }
    });
  };

  const calculateFaceSize = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return 0;

    // Use face landmarks to calculate face size
    const face = landmarks[0];

    if (!face || face.length === 0) return 0;

    // Get bounding box of face landmarks
    let minX = 1;
    let maxX = 0;
    let minY = 1;
    let maxY = 0;

    face.forEach((landmark: any) => {
      if (
        landmark &&
        typeof landmark.x === 'number' &&
        typeof landmark.y === 'number'
      ) {
        minX = Math.min(minX, landmark.x);
        maxX = Math.max(maxX, landmark.x);
        minY = Math.min(minY, landmark.y);
        maxY = Math.max(maxY, landmark.y);
      }
    });

    // Calculate face size as percentage of video area
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const faceSize = Math.max(faceWidth, faceHeight);

    return faceSize;
  };

  const isFaceInBounds = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return false;

    const face = landmarks[0];

    // Get face bounding box
    let minX = 1;
    let maxX = 0;
    let minY = 1;
    let maxY = 0;
    face.forEach((landmark: any) => {
      minX = Math.min(minX, landmark.x);
      maxX = Math.max(maxX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
    });

    const ovalCenterX = 0.5;
    const ovalCenterY = 0.7; // Shift center down to encourage lower positioning

    const isLandscape = videoAspectRatio.value > 1;
    let ovalWidth;
    let ovalHeight;
    if (isLandscape) {
      // For landscape, oval height is 60% of video height
      ovalHeight = 0.375;
      ovalWidth = ovalHeight / 2;
    } else {
      // For portrait, oval width is 60% of video width
      ovalWidth = 0.375;
      ovalHeight = ovalWidth * 2;
    }

    // Check if face center is within oval (more lenient approach)
    const faceCenterX = (minX + maxX) / 2;
    const faceCenterY = (minY + maxY) / 2;

    const checkPointInOval = (x: number, y: number) => {
      const dx = (x - ovalCenterX) / ovalWidth;
      const dy = (y - ovalCenterY) / ovalHeight;
      return dx * dx + dy * dy <= 1;
    };
    const centerInBounds = checkPointInOval(faceCenterX, faceCenterY);

    const toleranceX = 0.8;
    const toleranceY = 0.2;
    const adjustedOvalWidth = ovalWidth * (1 + toleranceX);
    const adjustedOvalHeight = ovalHeight * (1 + toleranceY);

    const checkPointInExpandedOval = (x: number, y: number) => {
      const dx = (x - ovalCenterX) / adjustedOvalWidth;
      const dy = (y - ovalCenterY) / adjustedOvalHeight;
      return dx * dx + dy * dy <= 1;
    };

    // Check if all corners are within the expanded oval
    const topLeft = checkPointInExpandedOval(minX, minY);
    const topRight = checkPointInExpandedOval(maxX, minY);
    const bottomLeft = checkPointInExpandedOval(minX, maxY);
    const bottomRight = checkPointInExpandedOval(maxX, maxY);

    // Face is in bounds if center is in oval AND most of face is within expanded bounds
    return centerInBounds && topLeft && topRight && bottomLeft && bottomRight;
  };

  // Utility function to update alert messages using MESSAGES keys
  const updateAlert = (messageKey: keyof typeof MESSAGES | null) => {
    if (messageKey && MESSAGES[messageKey]) {
      alertTitle.value = MESSAGES[messageKey];
    } else {
      alertTitle.value = '';
    }
  };

  // Helper function to calculate mouth opening using landmarks
  const calculateMouthOpening = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return 0;

    const face = landmarks[0];
    if (!face || face.length === 0) return 0;

    // MediaPipe face landmark indices for mouth
    const upperLipCenter = face[13]; // Upper lip center
    const lowerLipCenter = face[14]; // Lower lip center

    if (!upperLipCenter || !lowerLipCenter) return 0;

    // Calculate vertical distance between upper and lower lip
    const mouthHeight = Math.abs(lowerLipCenter.y - upperLipCenter.y);

    // Get face height for normalization
    const faceTop = Math.min(...face.map((p: any) => p.y));
    const faceBottom = Math.max(...face.map((p: any) => p.y));
    const faceHeight = faceBottom - faceTop;

    // Return normalized mouth opening (as fraction of face height)
    return faceHeight > 0 ? mouthHeight / faceHeight : 0;
  };

  // Helper function to create a cropped canvas for face detection
  const createCroppedVideoFrame = () => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;

    // Create a square crop from the center of the video
    const squareSize = Math.min(sourceWidth, sourceHeight);
    const cropX = (sourceWidth - squareSize) / 2;
    const cropY = (sourceHeight - squareSize) / 2;

    // Set canvas size to the square dimensions
    canvas.width = squareSize;
    canvas.height = squareSize;

    // Draw the cropped square video frame
    ctx.drawImage(
      video,
      cropX,
      cropY,
      squareSize,
      squareSize, // Source crop area (square)
      0,
      0,
      squareSize,
      squareSize, // Destination (full canvas)
    );

    return canvas;
  };

  const stopDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const pauseCapture = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    isPaused.value = true;

    // Don't override specific error messages with generic smile message
    if (
      !alertTitle.value.includes(MESSAGES['multiple-faces']) &&
      !alertTitle.value.includes('move') &&
      !alertTitle.value.includes('center')
    ) {
      updateAlert('smile-required');
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if this is the last capture (reference photo)
    if (capturesTaken.value === totalCaptures.value - 1) {
      // capture at higher resolution
      canvas.width = 640;
      canvas.height = 480;
      
      // Shift the source crop slightly upward to capture full head
      const sourceWidth = videoRef.current.videoWidth;
      const sourceHeight = videoRef.current.videoHeight;
      const verticalOffset = sourceHeight * 0.05; // Shift up by 5% of video height
      
      ctx.drawImage(
        videoRef.current,
        0,
        -verticalOffset, // Shift source up
        sourceWidth,
        sourceHeight,
        0,
        0,
        640,
        480,
      );
      referencePhoto.value = canvas.toDataURL('image/jpeg');
    } else {
      // lower resolution
      canvas.width = 320;
      canvas.height = 240;
      
      // Shift the source crop slightly upward to capture full head
      const sourceWidth = videoRef.current.videoWidth;
      const sourceHeight = videoRef.current.videoHeight;
      const verticalOffset = sourceHeight * 0.05; // Shift up by 5% of video height
      
      ctx.drawImage(
        videoRef.current,
        0,
        -verticalOffset, // Shift source up
        sourceWidth,
        sourceHeight,
        0,
        0,
        320,
        240,
      );
      const imageData = canvas.toDataURL('image/jpeg');
      capturedImages.value = [...capturedImages.value, imageData];
    }

    capturesTaken.value++;
    countdown.value = totalCaptures.value - capturesTaken.value;
  };

  const stopCapture = () => {
    stopDetectionLoop();
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    // Clean signal resets
    isCapturing.value = false;
    isPaused.value = false;
    alertTitle.value = '';
    faceLandmarks.value = [];

    if (capturesTaken.value >= totalCaptures.value && referencePhoto.value) {
      const livenessImages = capturedImages.value.map((img) => ({
        image: img.split(',')[1], // Remove the base64 prefix
        image_type_id: ImageType.LIVENESS_IMAGE_BASE64,
      }));

      const referenceImage = {
        image: referencePhoto.value.split(',')[1], // Remove the base64 prefix
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

      smartCameraWeb?.dispatchEvent(
        new CustomEvent('metadata.selfie-capture-end'),
      );

      hasFinishedCapture.value = true;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCaptureInterval = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
    }

    captureTimerRef.current = setInterval(() => {
      // Always current values - no ref synchronization needed!
      if (capturesTaken.value >= totalCaptures.value) {
        stopCapture();
        return;
      }

      // Check for multiple faces first
      if (multipleFaces.value) {
        pauseCapture();
        return;
      }

      // Check if face is detected before capturing
      if (!faceDetected.value) {
        return; // Skip this capture, don't increment counter
      }

      // Check face position
      if (!faceInBounds.value) {
        pauseCapture();
        return;
      }

      // Check face proximity
      if (faceProximity.value !== 'good') {
        pauseCapture();
        return;
      }

      const isInNeutralZone = capturesTaken.value < neutralZone.value;
      const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

      // Handle neutral expression requirement (first 30% of photos)
      if (isInNeutralZone && currentSmileScore.value >= smileThreshold) {
        return; // Skip this capture if smiling during neutral zone
      }

      // Handle smile checkpoint requirement - now includes mouth open check
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
      isPaused.value = false;
      updateAlert(null);
      startCaptureInterval();
    }
  };
  const detectSmile = async () => {
    // Keep face detection running even when not capturing
    if (!faceLandmarkerRef.current || !videoRef.current) {
      stopDetectionLoop();
      return;
    }

    try {
      // Create cropped frame for detection
      const croppedCanvas = createCroppedVideoFrame();
      const detectionSource = croppedCanvas || videoRef.current;

      const results = faceLandmarkerRef.current.detectForVideo(
        detectionSource,
        performance.now(),
      );

      faceLandmarks.value = results.faceLandmarks || [];

      if (results.faceLandmarks && canvasRef.current && videoRef.current && isCapturing.value) {
        // If we used cropped detection, we need to adjust landmark coordinates back to full video space
        if (croppedCanvas) {
          const sourceWidth = videoRef.current.videoWidth;
          const sourceHeight = videoRef.current.videoHeight;
          const squareSize = Math.min(sourceWidth, sourceHeight);
          const offsetX = (sourceWidth - squareSize) / (2 * sourceWidth);
          const offsetY = (sourceHeight - squareSize) / (2 * sourceHeight);
          const scaleFactor = squareSize / sourceWidth; // Scale factor for width
          const scaleFactorY = squareSize / sourceHeight; // Scale factor for height

          // Adjust landmarks to full video coordinates
          const adjustedLandmarks = results.faceLandmarks.map((face) =>
            face.map((landmark: any) => ({
              x: landmark.x * scaleFactor + offsetX,
              y: landmark.y * scaleFactorY + offsetY,
              z: landmark.z,
            })),
          );

          // Draw with adjusted coordinates
          const originalLandmarks = faceLandmarks.value;
          faceLandmarks.value = adjustedLandmarks;
          drawFaceMesh(adjustedLandmarks);
          faceLandmarks.value = originalLandmarks;
        } else {
          drawFaceMesh(results.faceLandmarks);
        }
      } else if (canvasRef.current && !isCapturing.value) {
        // Clear canvas when not capturing
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
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
        faceInBounds.value = isFaceInBounds(results.faceLandmarks);

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

        // Update current smile score and mouth open for UI feedback
        currentSmileScore.value = smileScore;
        currentMouthOpen.value = mouthOpen;

        if (smileScore >= smileThreshold && mouthOpen >= mouthOpenThreshold) {
          lastSmileTime.value = Date.now();
        }

        // Auto-resume if paused and all conditions are met (only when capturing)
        if (isPaused.value && isCapturing.value) {
          if (
            faceProximity.value === 'good' &&
            faceInBounds.value &&
            !multipleFaces.value
          ) {
            // For smile zones, also check if recently smiled with open mouth
            const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;
            const timeSinceSmile = Date.now() - lastSmileTime.value;

            if (!isInSmileZone || timeSinceSmile <= smileCooldown) {
              resumeCapture();
            }
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

      // Update overlay text based on current state - show alerts even when not capturing
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
        // Only show capture-specific messages when actually capturing
        const isInNeutralZone = capturesTaken.value < neutralZone.value;
        const isInSmileZone = capturesTaken.value >= smileCheckpoint.value;

        if (isInNeutralZone && currentSmileScore.value >= smileThreshold) {
          updateAlert('neutral-expression');
        } else if (isInNeutralZone) {
          alertTitle.value = 'Keep a neutral expression';
        } else if (capturesTaken.value === neutralZone.value) {
          alertTitle.value = 'Get ready to smile!';
        } else if (isInSmileZone) {
          const timeSinceSmile = Date.now() - lastSmileTime.value;
          if (timeSinceSmile > smileCooldown) {
            // Check if they're smiling but mouth is not open enough
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
          updateAlert(null); // Clear alerts
        }
      } else {
        // When not capturing but all conditions are good, show ready message
        alertTitle.value = 'Ready to capture';
      }
    } catch (error) {
      faceDetected.value = false;
      faceInBounds.value = false;
      multipleFaces.value = false;
      faceProximity.value = 'good';
      currentMouthOpen.value = 0;
      // Update overlay text on detection error - only during capture
      if (isCapturing.value && !isPaused.value) {
        updateAlert('no-face');
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectSmile);
  };

  const startDetectionLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(detectSmile);
  };

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

    // TODO: remove
    // Also dispatch to selfieCaptureScreens for backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.cancelled', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  const handleClose = () => {
    stopCapture();

    // Dispatch events on smartCameraWeb for communication with SelfieCaptureScreens
    window.dispatchEvent(
      new CustomEvent('selfie-capture.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );

    // TODO: remove
    // Also dispatch to selfieCaptureScreens for backwards compatibility
    window.dispatchEvent(
      new CustomEvent('selfie-capture-screens.close', {
        detail: { meta: { libraryVersion: COMPONENTS_VERSION } },
      }),
    );
  };

  // Agent mode functionality
  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Start new stream with new facing mode
    await startCamera();
  };

  // Check if agent mode is supported
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

  useEffect(() => {
    // Start camera and wait a bit for it to initialize before starting detection
    const initializeCamera = async () => {
      await startCamera();
      await checkAgentSupport();

      // Initialize face detection immediately on mount
      if (!faceLandmarkerRef.current) {
        await initializeFaceLandmarker();
      }
      
      // Start detection loop immediately after camera is ready
      setTimeout(() => {
        startDetectionLoop();
      }, 500);
    };

    initializeCamera();

    return () => {
      stopDetectionLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (captureTimerRef.current) {
        clearInterval(captureTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const navigation = navigationRef.current;

    if (navigation && showNavigation) {
      const handleNavigationBack = () => {
        handleCancel();
      };

      const handleNavigationClose = () => {
        handleClose();
      };

      navigation.addEventListener('navigation.back', handleNavigationBack);
      navigation.addEventListener('navigation.close', handleNavigationClose);

      return () => {
        navigation.removeEventListener('navigation.back', handleNavigationBack);
        navigation.removeEventListener('navigation.close', handleNavigationClose);
      };
    }
    return undefined;
  }, [showNavigation]);

  return (
    <div className="selfie-booth">
      {/* SmileID Navigation Component */}
      {showNavigation && (
        // @ts-ignore
        <smileid-navigation ref={navigationRef} theme-color={themeColor} />
      )}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300,
          margin: '0 auto',
        }}
      >
        {/* Clipping container with fixed max width */}
        <div
          className="video-wrapper"
          style={{
            clipPath: multipleFaces.value ? 'none' : 'url(#selfie-clip-path)',
          }}
        >
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {!multipleFaces.value && (
          <OvalProgress
            progress={
              capturesTaken.value > 0
                ? capturesTaken.value / totalCaptures.value
                : 0
            }
            duration={interval}
            themeColor={themeColor}
          />
        )}
      </div>
      {alertTitle.value && (
        <div className="alert-message">
          <div className="alert-title">{alertTitle.value}</div>
        </div>
      )}
      <div className="controls">
        <button
          class="btn-primary"
          onClick={startCapture}
          disabled={isCapturing.value || hasFinishedCapture.value || !isReadyToCapture.value}
        >
          Start Capture
        </button>

        {allowAgentMode && (agentSupported || showAgentModeForTests) && (
          <button
            onClick={switchCamera}
            className="agent-mode-btn"
            disabled={isCapturing.value || hasFinishedCapture.value}
          >
            {facingMode === 'user' ? 'Agent Mode Off' : 'Agent Mode On'}
          </button>
        )}
      </div>
      {/* {capturedImages.value.length > 0 && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="image-preview-container">
            {capturedImages.value.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img} alt={`Selfie ${index + 1}`} />
                <span>#{index + 1}</span>
              </div>
            ))}
            {referencePhoto.value && (
              <div className="image-preview reference-photo">
                <img src={referencePhoto.value} alt="Reference Photo" />
                <span>REF</span>
              </div>
            )}
          </div>
        </div>
      )} */}
      {/* @ts-ignore */}
      {!hideAttribution && <powered-by-smile-id></powered-by-smile-id>}
      <style>{`
        * {
          box-sizing: border-box;
        }

        button.btn-primary {
          background-color: ${themeColor || '#001096'};
          border-radius: 2.5rem;
          color: white;
          border: none;
          height: 3.125rem;
          display: inline-block;
          padding: 0.75rem 1.5rem;
          text-align: center;
          font-size: 1.125rem;
          font-weight: 600;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
        }
        
        button.btn-primary:hover {
          background-color: #2d2b2a;
        }
        
        button.btn-primary:disabled {
          background-color: #666;
        }

        .selfie-booth {
          font-family: sans-serif;
          max-width: 356px;
          margin: 0 auto;
          padding-block: 2rem;
        }

        .video-wrapper {
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
        }

        .video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .alert-message {
          margin-top: 1.5rem;
          color: #000;
          padding: 0.5rem 1.5rem;
          background: #e5e5e5;
          border: 1px solid #848282;
          border-radius: 4px;
          text-align: start;
          width: 100%;
        }

        .alert-title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
        }
        
        .controls {
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: center;
        }

        button {
          padding: 10px 20px;
          background: ${themeColor || '#001096'};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .agent-mode-btn {
          background: ${themeColor || '#001096'};
          font-size: 14px;
          padding: 8px 16px;
        }

        .preview-section {
          margin-top: 40px;
        }

        .image-preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }

        .image-preview {
          position: relative;
          width: 100px;
          height: 100px;
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview span {
          position: absolute;
          bottom: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 2px 5px;
          font-size: 12px;
        }

        .reference-photo {
          border: 2px solid #001096;
        }

        .reference-photo span {
          background: #001096;
        }
      `}</style>
    </div>
  );
};

if (!customElements.get('selfie-booth')) {
  register(
    SelfieBooth,
    'selfie-booth',
    [
      'interval',
      'duration',
      'theme-color',
      'show-navigation',
      'allow-agent-mode',
      'show-agent-mode-for-tests',
      'hide-attribution',
      'disable-image-tests',
    ],
    { shadow: true },
  );
}

export default SelfieBooth;
