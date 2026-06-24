// Shared helpers for the document-verification submission card
// (`<document-capture-submission>`, queried as `#doc-submission`). Used by both
// the basic doc-verification and enhanced-document-verification flows, which
// host the same element and drive it identically.

// Reconstruct a data URI for the captured document so the submission screen
// can show it behind the status card. Publish images carry raw base64 with
// the data: prefix stripped, so we re-add it.
//
// Pick the most recent ID-card image by type id (front=3, back=7) rather than
// blindly taking the last array entry — enhanced flows also publish selfie
// (2) / liveness (6) frames, and relying on append order would risk showing a
// face behind the document card.
export function getDocPreviewDataUri(capturedImages) {
  if (!Array.isArray(capturedImages)) return '';
  const ID_CARD_TYPE_IDS = [3, 7];
  const docImages = capturedImages.filter(
    (img) => img?.image && ID_CARD_TYPE_IDS.includes(img.image_type_id),
  );
  const chosen =
    docImages[docImages.length - 1] ||
    capturedImages[capturedImages.length - 1];
  if (!chosen?.image) return '';
  return `data:image/jpeg;base64,${chosen.image}`;
}

// Bind the submission-card handlers to the stable DOM dependencies (the element
// and the fallback screens / `setActiveScreen`, all resolved at startup).
// `config` is passed to `showDocSubmission` at call time because it is assigned
// late from the host's postMessage handler.
export function createDocSubmission({
  docSubmission,
  setActiveScreen,
  completeScreen,
  uploadFailureScreen,
}) {
  // Prime the <document-capture-submission> element with the captured image,
  // partner theme/attribution, and the initial "submitting" state.
  function showDocSubmission(config, capturedImages) {
    if (!docSubmission) return;
    const previewSrc = getDocPreviewDataUri(capturedImages);
    if (previewSrc) docSubmission.setAttribute('image-src', previewSrc);
    if (config.partner_details?.theme_color) {
      docSubmission.setAttribute(
        'theme-color',
        config.partner_details.theme_color,
      );
    }
    if (config.hide_attribution) {
      docSubmission.setAttribute('hide-attribution', 'true');
    }
    docSubmission.setAttribute('show-navigation', '');
    // Clear any message left over from a prior attempt before re-submitting.
    docSubmission.removeAttribute('submission-message');
    docSubmission.setAttribute('submission-state', 'submitting');
  }

  // Flip the submission card between submitting → success / error. Driven by
  // the upload lifecycle below (mirrors the Enhanced SmartSelfie host pattern).
  // Falls back to the legacy static screens if the element isn't present.
  function setDocSubmissionState(state, message) {
    if (!docSubmission) {
      setActiveScreen(
        state === 'success' ? completeScreen : uploadFailureScreen,
      );
      return;
    }
    docSubmission.setAttribute('submission-state', state);
    if (message) {
      docSubmission.setAttribute('submission-message', message);
    } else {
      docSubmission.removeAttribute('submission-message');
    }
  }

  return { showDocSubmission, setDocSubmissionState };
}
