# Instructions

These components can be used to capture id document or liveness images

1. [`smart-camera-web`](./components/smart-camera-web/src/)
2. [`document-capture-screens`](./components/document/src/README.md)
3. [`selfie-capture-screens`](./components/selfie/README.md)

## Localization

The web components support multiple languages and string customization through the localisation module.

### Quick Start

```javascript
import {
  setCurrentLocale,
  getDirection,
} from '@smileid/web-components/localisation';

// Set language (supports 'en', 'fr', 'ar')
await setCurrentLocale('fr');

// Apply RTL direction for Arabic
document.documentElement.dir = getDirection();
```

### Customizing Strings

Override specific UI text:

```javascript
await setCurrentLocale('en', {
  locales: {
    en: {
      selfie: {
        instructions: {
          title: 'Verify your identity with a selfie',
        },
      },
    },
  },
});
```

### Adding Custom Languages

Register a new language:

```javascript
import {
  registerLocale,
  setCurrentLocale,
} from '@smileid/web-components/localisation';

registerLocale('sw', {
  direction: 'ltr',
  common: {
    back: 'Rudi',
    continue: 'Endelea',
    // ... all required keys
  },
});

await setCurrentLocale('sw');
```

📖 **[Full Localization Guide](https://github.com/smileidentity/web-client/blob/main/packages/web-components/LOCALIZATION.md)** - Complete documentation including available languages, all translation keys, and custom language setup.

## Orchestration

To build your own flow, we have several components that can be used together.

### document-capture-instructions

This is the screen used to instruct the user how to capture document using both the camera and/or upload.
