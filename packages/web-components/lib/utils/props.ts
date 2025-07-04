export const getBoolProp = (
  value: string | boolean | undefined,
  defaultValue: boolean = false,
): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '';
  }
  return defaultValue;
};

export const getStringProp = (
  element: HTMLElement,
  attributeName: string,
  defaultValue: string = '',
): string => element.getAttribute(attributeName) || defaultValue;
