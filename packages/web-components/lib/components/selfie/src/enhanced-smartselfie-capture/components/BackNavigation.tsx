import type { FunctionComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

interface BackNavigationProps {
  onBack: () => void;
  themeColor?: string;
}

/**
 * Thin Preact wrapper around <smileid-navigation hide-close> that bridges
 * the element's custom `navigation.back` event to a Preact callback prop.
 * Kept in ESS so callers don't have to think about the underlying element.
 */
export const BackNavigation: FunctionComponent<BackNavigationProps> = ({
  onBack,
  themeColor,
}) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const handler = () => onBack();
    el.addEventListener('navigation.back', handler);
    return () => el.removeEventListener('navigation.back', handler);
  }, [onBack]);

  return (
    // @ts-expect-error custom element
    <smileid-navigation
      ref={ref}
      hide-close=""
      theme-color={themeColor || undefined}
      class="ess-back-navigation"
      style={{
        // Match the ESS design: solid dark circle with a white arrow,
        // overriding Navigation's default translucent grey pill.
        '--smileid-navigation-button-bg': '#1f1f1f',
        '--smileid-navigation-icon-color': '#FFFFFF',
      }}
    />
  );
};

export default BackNavigation;
