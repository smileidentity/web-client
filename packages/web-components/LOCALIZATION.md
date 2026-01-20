# Localization Guide

This guide explains how to configure languages, customize UI strings, and add custom translations when integrating the SmileID SDK.

## Table of Contents

- [Localization Guide](#localization-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Fallback Behavior](#fallback-behavior)
  - [Available Languages](#available-languages)
  - [Using Locale with the Embed Script](#using-locale-with-the-embed-script)
    - [Setting the Language](#setting-the-language)
    - [Customizing Specific Strings](#customizing-specific-strings)
    - [Complete Embed Example](#complete-embed-example)
  - [Using Locale with CDN](#using-locale-with-cdn)
    - [Basic Setup](#basic-setup)
    - [Customizing Specific Strings](#customizing-specific-strings-1)
    - [Registering a Custom Language](#registering-a-custom-language)
    - [Complete CDN Example](#complete-cdn-example)
  - [Using Locale with Web Components (ESM)](#using-locale-with-web-components-esm)
    - [Basic Setup](#basic-setup-1)
    - [Applying RTL Direction](#applying-rtl-direction)
    - [Using Translations in Your Code](#using-translations-in-your-code)
    - [Complete Web Components Example](#complete-web-components-example)
  - [Adding a Custom Language](#adding-a-custom-language)
    - [Custom Language via Embed](#custom-language-via-embed)
    - [Custom Language via Web Components](#custom-language-via-web-components)
  - [Translation Key Reference](#translation-key-reference)
    - [Key Structure](#key-structure)
    - [Commonly Customized Keys](#commonly-customized-keys)
      - [Common/Navigation](#commonnavigation)
      - [Selfie Capture](#selfie-capture)
      - [Document Capture](#document-capture)
      - [Camera Permission](#camera-permission)
      - [Status Pages](#status-pages)
  - [Troubleshooting](#troubleshooting)
    - [Translations Not Appearing](#translations-not-appearing)
    - [RTL Layout Not Working](#rtl-layout-not-working)
    - [Console Warnings About Missing Keys](#console-warnings-about-missing-keys)
  - [Additional Resources](#additional-resources)

---

## Overview

The SmileID SDK supports multiple languages and allows you to:

1. **Switch languages** - Display the UI in English, French, or Arabic
2. **Customize strings** - Override specific text like button labels or instructions
3. **Add custom languages** - Provide complete translations for languages not bundled with the SDK

### Fallback Behavior

The SDK uses a 3-level fallback chain for translations:

1. **Current locale** - The language you've configured
2. **Default locale** - English (`en-GB`) as the fallback
3. **Raw key** - If no translation is found, the key itself is displayed (with a console warning)

This ensures the UI always displays something meaningful, even if a translation is missing.

---

## Available Languages

The SDK includes these bundled languages:

| Language          | Code    | Short Code | Direction |
| ----------------- | ------- | ---------- | --------- |
| English (British) | `en-GB` | `en`       | LTR       |
| French (France)   | `fr-FR` | `fr`       | LTR       |
| Arabic (Egyptian) | `ar-EG` | `ar`       | RTL       |

You can use either the full code (e.g., `en-GB`) or the short code (e.g., `en`).

---

## Using Locale with the Embed Script

When using the SmileID embed script (via `window.SmileIdentity()`), configure locale through the `translation` option.

### Setting the Language

To change the UI language, set the `language` property:

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  // Set language to French
  translation: {
    language: 'fr-FR',
  },

  partner_details: {
    partner_id: 'your-partner-id',
    // ... other details
  },
  onSuccess: () => console.log('Success'),
  onError: (error) => console.error(error),
});
```

### Customizing Specific Strings

To override specific UI strings while keeping the rest of the default translations, use the `locales` object:

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  translation: {
    language: 'en-GB',
    locales: {
      'en-GB': {
        // Override common button labels
        common: {
          continue: 'Proceed to Next Step',
          back: 'Go Back',
        },
        // Override selfie screen text
        selfie: {
          instructions: {
            title: 'Time for a quick selfie!',
          },
          review: {
            acceptButton: 'Looks good!',
            retakeButton: 'Try again',
          },
        },
      },
    },
  },

  partner_details: {
    /* ... */
  },
  onSuccess: () => {},
  onError: () => {},
});
```

### Complete Embed Example

Here's a complete example showing language selection with custom overrides:

```javascript
// Get language from user preference or browser
const userLanguage = navigator.language.startsWith('fr') ? 'fr-FR' : 'en-GB';

window.SmileIdentity({
  token: tokenFromServer,
  product: 'biometric_kyc',
  callback_url: 'https://api.yourcompany.com/callback',
  environment: 'sandbox',

  translation: {
    language: userLanguage,
    locales: {
      // English customizations
      'en-GB': {
        common: {
          continue: 'Next',
          back: 'Previous',
        },
        selfie: {
          instructions: {
            title: 'Verify your identity with a selfie',
          },
        },
        document: {
          title: {
            front: 'Scan the front of your ID',
            back: 'Scan the back of your ID',
          },
        },
      },
      // French customizations
      'fr-FR': {
        common: {
          continue: 'Suivant',
          back: 'Précédent',
        },
      },
    },
  },

  partner_details: {
    partner_id: 'your-partner-id',
    signature: 'your-signature',
    timestamp: 'your-timestamp',
    name: 'Your Company',
    logo_url: 'https://yourcompany.com/logo.png',
    policy_url: 'https://yourcompany.com/privacy',
    theme_color: '#007bff',
  },

  onSuccess: (response) => {
    console.log('Verification successful', response);
  },
  onClose: () => {
    console.log('User closed the modal');
  },
  onError: (error) => {
    console.error('Verification error', error);
  },
});
```

---

## Using Locale with CDN

When loading the SmileID Web Components via CDN script tag, you can configure locale using the global `SmartCameraWeb` object exposed on the `window`.

### Basic Setup

Include the script and set the locale before your components render:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SmileID Verification</title>
    <!-- Load SmileID Web Components from CDN -->
    <script src="https://cdn.smileidentity.com/js/<version>/smart-camera-web.js"></script>
  </head>
  <body>
    <smart-camera-web></smart-camera-web>

    <script>
      // Set locale before the component renders
      window.SmartCameraWeb.setCurrentLocale('fr-FR');
    </script>
  </body>
</html>
```

### Customizing Specific Strings

Override specific UI strings while keeping the rest of the default translations using the `locales` option:

```html
<script>
  window.SmartCameraWeb.setCurrentLocale('en-GB', {
    locales: {
      'en-GB': {
        // Override common button labels
        common: {
          continue: 'Proceed to Next Step',
          back: 'Go Back',
        },
        // Override selfie screen text
        selfie: {
          instructions: {
            title: 'Time for a quick selfie!',
          },
          review: {
            acceptButton: 'Looks good!',
            retakeButton: 'Try again',
          },
        },
      },
    },
  });

  // Re-render the component to apply the new language
  // Only needed if the component was previously rendered
  const app = document.querySelector('smart-camera-web');
  app.reset();
</script>
```

### Registering a Custom Language

To add a completely new language, use `registerLocale` before setting it as the current locale:

```html
<script>
  // Register a new Swahili (Kenya) locale
  window.SmartCameraWeb.registerLocale('sw-KE', {
    direction: 'ltr',
    common: {
      back: 'Rudi',
      close: 'Funga',
      continue: 'Endelea',
      cancel: 'Ghairi',
      or: 'au',
      allow: 'Ruhusu',
    },
    selfie: {
      instructions: {
        title: 'Ifuatayo, tutapiga picha ya haraka',
      },
      capture: {
        button: {
          takeSelfie: 'Piga Picha',
        },
      },
      review: {
        title: 'Kagua Picha',
        question: 'Je, uso wako wote unaonekana wazi?',
        acceptButton: 'Ndiyo, tumia hii',
        retakeButton: 'Hapana, piga tena',
      },
    },
    // ... add all other required translation keys
  });

  // Now set the registered locale as active
  window.SmartCameraWeb.setCurrentLocale('sw-KE');

  // Re-render the component to apply the new language
  // Only needed if the component was previously rendered
  const app = document.querySelector('smart-camera-web');
  app.reset();
</script>
```

### Complete CDN Example

Here's a complete example showing language selection with custom overrides:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SmileID Verification</title>
    <script src="https://cdn.smileidentity.com/js/<version>/smart-camera-web.js"></script>
  </head>
  <body>
    <div id="verification-container">
      <smart-camera-web></smart-camera-web>
    </div>

    <script>
      // Detect user's preferred language
      const userLanguage = navigator.language.startsWith('fr')
        ? 'fr-FR'
        : 'en-GB';

      // Set locale with custom overrides
      window.SmartCameraWeb.setCurrentLocale(userLanguage, {
        locales: {
          'en-GB': {
            common: {
              continue: 'Next',
              back: 'Previous',
            },
            selfie: {
              instructions: {
                title: 'Verify your identity with a selfie',
              },
            },
          },
          'fr-FR': {
            common: {
              continue: 'Suivant',
              back: 'Précédent',
            },
          },
        },
      });

      // Get the component and re-render to apply the new language
      // Only needed if the component was previously rendered
      const smartCamera = document.querySelector('smart-camera-web');
      smartCamera.reset();

      // Listen for events
      smartCamera.addEventListener('smart-camera-web.publish', (event) => {
        console.log('Capture complete:', event.detail);
      });
    </script>
  </body>
</html>
```

---

## Using Locale with Web Components (ESM)

When using SmileID web components directly via ES modules (e.g., `<selfie-capture-screens>`, `<document-capture-screens>`), you configure locale programmatically using the localization module.

### Basic Setup

Import and set the locale before rendering components:

```javascript
import {
  setCurrentLocale,
  getDirection,
} from '@smileid/web-components/localisation';

// Set locale when your app initializes
async function initializeSmileID() {
  await setCurrentLocale('fr-FR');

  // Now render your components
  renderVerificationUI();
}

initializeSmileID();
```

### Applying RTL Direction

For right-to-left languages like Arabic, apply the text direction to your container:

```javascript
import {
  setCurrentLocale,
  getDirection,
} from '@smileid/web-components/localisation';

async function initializeWithRTL() {
  await setCurrentLocale('ar-EG');

  // Apply direction to document or container
  document.documentElement.dir = getDirection(); // Returns 'rtl' for Arabic

  // Or apply to a specific container
  const container = document.getElementById('smileid-container');
  container.dir = getDirection();
}
```

### Using Translations in Your Code

If you need to display translated strings in your own UI:

```javascript
import { t, tHtml } from '@smileid/web-components/localisation';

// Simple translation
const backButtonText = t('common.back'); // "Back" (or translation)

// Translation with interpolation
const errorMessage = tHtml('pages.error.countryNotSupported', {
  country: 'Nigeria',
}); // "Nigeria is not supported"

// Translation with styled interpolation
const consentMessage = tHtml('consent.accessRequest', {
  partnerName: { value: 'Acme Corp', className: 'highlight' },
  idTypeLabel: 'BVN',
});
// Returns: "<span class="highlight">Acme Corp</span> wants to access your BVN information"
```

### Complete Web Components Example

Here's a complete example using web components with locale configuration:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SmileID Verification</title>
    <script type="module">
      import '@smileid/web-components';
      import {
        setCurrentLocale,
        getDirection,
      } from '@smileid/web-components/localisation';

      async function initializeVerification() {
        // Set locale with custom overrides
        await setCurrentLocale('en-GB', {
          locales: {
            'en-GB': {
              selfie: {
                instructions: {
                  title: 'Verify your identity',
                },
              },
            },
          },
        });

        // Apply text direction
        document.documentElement.dir = getDirection();

        // Get the selfie capture component
        const selfieCapture = document.querySelector('selfie-capture-screens');

        // Listen for capture complete
        selfieCapture.addEventListener(
          'selfie-capture-screens.publish',
          (event) => {
            console.log('Selfie captured:', event.detail);
          },
        );
      }

      document.addEventListener('DOMContentLoaded', initializeVerification);
    </script>
  </head>
  <body>
    <div id="verification-container">
      <selfie-capture-screens
        show-navigation="true"
        hide-back-to-host="false"
      ></selfie-capture-screens>
    </div>
  </body>
</html>
```

---

## Adding a Custom Language

You can add support for any language by providing a complete translation object.

### Custom Language via Embed

Add a new language through the `locales` option:

```javascript
window.SmileIdentity({
  token: 'your-token',
  product: 'biometric_kyc',
  callback_url: 'https://your-callback.com',

  translation: {
    language: 'sw-KE', // Use the new language
    locales: {
      // Define the new Swahili (Kenya) language
      'sw-KE': {
        direction: 'ltr',
        common: {
          back: 'Rudi',
          close: 'Funga',
          continue: 'Endelea',
          cancel: 'Ghairi',
          or: 'au',
          allow: 'Ruhusu',
        },
        camera: {
          permission: {
            description: 'Ruhusu ufikiaji wa kamera kuthibitisha maelezo yako',
            requestButton: 'Omba Ufikiaji wa Kamera',
          },
          error: {
            notAllowed:
              'Ufikiaji wa kamera haukuruhusiwa. Wezesha ufikiaji katika kivinjari chako kuendelea.',
            notFound: 'Hatuwezi kupata kamera yako. Tafadhali onyesha upya.',
          },
        },
        selfie: {
          instructions: {
            title: 'Ifuatayo, tutapiga picha ya haraka',
          },
          capture: {
            button: {
              takeSelfie: 'Piga Picha',
            },
          },
          review: {
            title: 'Kagua Picha',
            question: 'Je, uso wako wote unaonekana wazi?',
            acceptButton: 'Ndiyo, tumia hii',
            retakeButton: 'Hapana, piga tena',
          },
        },
        document: {
          title: {
            front: 'Wasilisha Mbele ya Kitambulisho',
            back: 'Wasilisha Nyuma ya Kitambulisho',
          },
          capture: {
            captureButton: 'Piga Hati',
          },
          review: {
            acceptButton: 'Ndiyo, kitambulisho changu kinasomeka',
            retakeButton: 'Hapana, piga tena',
          },
        },
        pages: {
          loading: {
            title: 'Inaandaa',
            description: 'Tunaandaa mtiririko wako wa uthibitishaji',
          },
          complete: {
            title: 'Uwasilishaji Umekamilika',
          },
        },
        // ... add more translations as needed
      },
    },
  },

  partner_details: {
    /* ... */
  },
  onSuccess: () => {},
  onError: () => {},
});
```

### Custom Language via Web Components

Use `registerLocale()` for inline definitions:

```javascript
import {
  registerLocale,
  setCurrentLocale,
} from '@smileid/web-components/localisation';

// Register a new language
registerLocale('sw-KE', {
  direction: 'ltr',
  common: {
    back: 'Rudi',
    close: 'Funga',
    continue: 'Endelea',
    cancel: 'Ghairi',
    or: 'au',
    allow: 'Ruhusu',
  },
  // ... rest of translations
});

// Then set it as the current locale
await setCurrentLocale('sw-KE');
```

> **Tip**: Use the [English translation file](https://github.com/smileidentity/web-client/blob/main/packages/web-components/locales/en-GB.json) as a starting point for your custom language.

---

## Translation Key Reference

### Key Structure

Translation keys use dot notation to represent the nested JSON structure:

```
section.subsection.key
```

For example, `selfie.review.acceptButton` corresponds to:

```json
{
  "selfie": {
    "review": {
      "acceptButton": "Yes, use this"
    }
  }
}
```

### Commonly Customized Keys

Here are the most frequently customized translation keys:

#### Common/Navigation

| Key               | Default (English) | Description               |
| ----------------- | ----------------- | ------------------------- |
| `common.continue` | "Continue"        | Primary action button     |
| `common.back`     | "Back"            | Back navigation button    |
| `common.cancel`   | "Cancel"          | Cancel action button      |
| `common.close`    | "Close"           | Close modal/screen button |

#### Selfie Capture

| Key                                | Default (English)                     | Description                 |
| ---------------------------------- | ------------------------------------- | --------------------------- |
| `selfie.instructions.title`        | "Next, we'll take a quick selfie"     | Selfie instructions heading |
| `selfie.capture.button.takeSelfie` | "Capture Selfie"                      | Capture button label        |
| `selfie.capture.tip.fitHead`       | "Fit your head inside the oval frame" | Capture guidance text       |
| `selfie.review.title`              | "Review Selfie"                       | Review screen heading       |
| `selfie.review.question`           | "Is your whole face clear?"           | Review prompt               |
| `selfie.review.acceptButton`       | "Yes, use this"                       | Accept button               |
| `selfie.review.retakeButton`       | "No, Retake Selfie"                   | Retake button               |

#### Document Capture

| Key                                | Default (English)                      | Description           |
| ---------------------------------- | -------------------------------------- | --------------------- |
| `document.title.front`             | "Submit Front of ID"                   | Front capture heading |
| `document.title.back`              | "Submit Back of ID"                    | Back capture heading  |
| `document.capture.captureButton`   | "Capture Document"                     | Capture button        |
| `document.capture.instructionText` | "Make sure all corners are visible..." | Capture guidance      |
| `document.review.acceptButton`     | "Yes, my ID is readable"               | Accept button         |
| `document.review.retakeButton`     | "No, retake photo"                     | Retake button         |

#### Camera Permission

| Key                               | Default (English)                            | Description                |
| --------------------------------- | -------------------------------------------- | -------------------------- |
| `camera.permission.description`   | "Allow camera access to verify your details" | Permission request message |
| `camera.permission.requestButton` | "Request Camera Access"                      | Permission button          |
| `camera.error.notAllowed`         | "Camera access not granted..."               | Access denied error        |
| `camera.error.notFound`           | "We are unable to find your camera..."       | No camera error            |

#### Status Pages

| Key                         | Default (English)                          | Description          |
| --------------------------- | ------------------------------------------ | -------------------- |
| `pages.loading.title`       | "Setting up"                               | Loading screen title |
| `pages.loading.description` | "We are setting up your verification flow" | Loading message      |
| `pages.complete.title`      | "Submission Complete"                      | Success screen title |
| `pages.error.title`         | "An error occurred"                        | Error screen title   |
| `pages.error.tryAgain`      | "Try again"                                | Retry button         |

---

## Troubleshooting

### Translations Not Appearing

**Issue**: Custom translations aren't showing up in the UI.

**Solutions**:

1. Ensure you're using the correct key structure (dot notation)
2. Check that the locale is set before components render
3. Verify the `language` value matches the key in `locales`

```javascript
// ❌ Wrong: language doesn't match locale key
translation: {
  language: 'english',
  locales: { en: { ... } }
}

// ✅ Correct: language matches locale key
translation: {
  language: 'en-GB',
  locales: { 'en-GB': { ... } }
}
```

### RTL Layout Not Working

**Issue**: Arabic text displays left-to-right.

**Solutions**:

1. Ensure your locale includes `"direction": "rtl"`
2. For web components, manually apply direction:

```javascript
document.documentElement.dir = getDirection();
```

### Console Warnings About Missing Keys

**Issue**: Console shows "Translation key 'x' not found in any locale".

**Solutions**:

1. The key may be misspelled - check the [Translation Key Reference](#translation-key-reference)
2. For custom languages, ensure all required keys are included

---

## Additional Resources

- [English Translation (Template)](https://github.com/smileidentity/web-client/blob/main/packages/web-components/locales/en-GB.json) - Use as a starting point for custom languages
- [Example App](../../example/) - Working example with locale configuration
- [SmileID Documentation](https://docs.usesmileid.com/) - Full SDK documentation
