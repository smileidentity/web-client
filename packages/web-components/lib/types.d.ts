declare module 'validate.js' {
  const validate: any;
  export default validate;
}

declare module 'signature_pad' {
  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: any);

    clear(): void;

    toDataURL(type?: string): string;

    fromDataURL(dataURL: string): void;

    isEmpty(): boolean;

    on(event: string, callback: Function): void;

    off(event: string, callback: Function): void;
  }
}

// Global constants
declare const SMILE_COMPONENTS_VERSION: string;
declare const COMPONENTS_VERSION: string;

// Custom Elements
declare namespace JSX {
  interface IntrinsicElements {
    'camera-permission': any;
    'selfie-capture-screens': any;
    'document-capture-screens': any;
    'document-capture': any;
    'document-capture-instructions': any;
    'document-capture-review': any;
    'enhanced-selfie-capture': any;
    'selfie-capture': any;
    'selfie-capture-instructions': any;
    'selfie-capture-review': any;
    'smileid-navigation': any;
    'smileid-combobox': any;
    'smileid-combobox-trigger': any;
    'smileid-combobox-listbox': any;
    'smileid-combobox-option': any;
    'end-user-consent': any;
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
}

export {};
