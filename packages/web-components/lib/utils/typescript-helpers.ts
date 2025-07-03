/**
 * Utility functions and types for migrating vanilla JS components to TypeScript
 */

// Base interface for all SmileID components
export interface SmileIDComponentBase {
  themeColor?: string;
  showNavigation?: boolean;
  hideAttribution?: boolean;
  hideInstructions?: boolean;
}

// Common component properties
export interface ComponentProps extends SmileIDComponentBase {
  [key: string]: any;
}

// Type-safe attribute getter/setter
export function getAttributeAsBoolean(element: HTMLElement, attributeName: string, defaultValue: boolean = false): boolean {
  return element.hasAttribute(attributeName) || defaultValue;
}

export function getAttributeAsString(element: HTMLElement, attributeName: string, defaultValue: string = ''): string {
  return element.getAttribute(attributeName) || defaultValue;
}

export function setAttributeBoolean(element: HTMLElement, attributeName: string, value: boolean): void {
  if (value) {
    element.setAttribute(attributeName, '');
  } else {
    element.removeAttribute(attributeName);
  }
}

// Event helpers
export interface ComponentEvent<T = any> extends CustomEvent {
  detail: T;
}

export function createComponentEvent<T>(type: string, detail: T, options?: Partial<CustomEventInit>): ComponentEvent<T> {
  return new CustomEvent(type, {
    bubbles: true,
    cancelable: false,
    ...options,
    detail,
  });
}

// Component lifecycle helpers
export abstract class TypeSafeWebComponent extends HTMLElement {
  protected _connected: boolean = false;

  abstract connectedCallback(): void;

  abstract disconnectedCallback?(): void;

  protected emitEvent<T>(type: string, detail: T): void {
    this.dispatchEvent(createComponentEvent(type, detail));
  }

  protected getThemeColor(): string {
    return this.getAttribute('theme-color') || '#001096';
  }

  protected getShowNavigation(): boolean {
    return this.hasAttribute('show-navigation');
  }

  protected getHideAttribution(): boolean {
    return this.hasAttribute('hide-attribution');
  }

  protected getHideInstructions(): boolean {
    return this.hasAttribute('hide-instructions');
  }
}

// Data transformation helpers
export function sanitizeComponentData(data: any): any {
  // Remove any potentially harmful properties and ensure data integrity
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'function') {
      continue; // Skip functions
    }
    if (key.startsWith('_') || key.startsWith('$')) {
      continue; // Skip private properties
    }
    sanitized[key] = value;
  }
  return sanitized;
}

// Component registration helper
export function registerComponent(tagName: string, componentClass: CustomElementConstructor): void {
  if ('customElements' in window && !window.customElements.get(tagName)) {
    window.customElements.define(tagName, componentClass);
  }
}

// Migration helper for existing components
export function createMigrationWrapper<T extends HTMLElement>(
  originalComponent: T,
  enhancements: Partial<T>,
): T {
  return Object.assign(originalComponent, enhancements);
}
