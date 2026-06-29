// Vite resolves SVG imports to URL strings by default.
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.svg?raw' {
  const src: string;
  export default src;
}

// .lottie animation packages — imported as URLs (or inlined data URLs) via Vite.
declare module '*.lottie' {
  const src: string;
  export default src;
}

declare module '*.lottie?url' {
  const src: string;
  export default src;
}

declare module 'signature_pad' {
  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: any);

    clear(): void;

    toDataURL(type?: string): string;

    fromDataURL(dataURL: string): void;

    isEmpty(): boolean;

    on(event: string, callback: (...args: unknown[]) => void): void;

    off(event: string, callback: (...args: unknown[]) => void): void;
  }
}

// Global constants
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const SMILE_COMPONENTS_VERSION: string;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const COMPONENTS_VERSION: string;
// Build-time debug gate (Vite `define`, see vite.config.ts). Replaced inline
// with a `true`/`false` literal at build, so guarding debug-only code with it
// lets the bundler dead-code-eliminate that code from production builds.
// `undefined` covers bundlers/runtimes that don't inject the define.
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// Custom Elements
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace JSX {
  interface IntrinsicElements {
    'camera-permission': any;
    'selfie-capture-screens': any;
    'document-capture-screens': any;
    'document-capture': any;
    'document-capture-instructions': any;
    'document-capture-instructions-v2': any;
    'document-capture-review': any;
    'smartselfie-capture': any;
    'selfie-capture': any;
    'selfie-capture-instructions': any;
    'selfie-capture-review': any;
    'smileid-navigation': any;
    'smileid-combobox': any;
    'smileid-combobox-trigger': any;
    'smileid-combobox-listbox': any;
    'smileid-combobox-option': any;
    'end-user-consent': any;
    'enhanced-smart-selfie-consent': any;
    'enhanced-smart-selfie-submission': any;
    'totp-consent': any;
    'signature-pad': any;
    'smart-camera-web': any;
    'powered-by-smile-id': any;
  }
}

interface HTMLElementConstructor {
  new (): HTMLElement;
}

interface CustomElementRegistry {
  define(
    name: string,
    constructor: HTMLElementConstructor,
    options?: ElementDefinitionOptions,
  ): void;
  get(name: string): HTMLElementConstructor | undefined;
  whenDefined(name: string): Promise<HTMLElementConstructor>;
}

declare global {
  interface Window {
    customElements: CustomElementRegistry;
  }
  declare const __SMILE_DEBUG__: boolean | undefined;
}

export {};
