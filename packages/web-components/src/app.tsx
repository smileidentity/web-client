import { useState, useEffect } from 'preact/hooks';
import { createElement } from 'preact';
import '../lib/main';
import { DebugPanel } from './components/DebugPanel';

const App = () => {
  const getUrlParams = () => new URLSearchParams(window.location.search);

  const getInitialComponent = () => {
    const params = getUrlParams();
    return params.get('component') || 'selfie-capture';
  };

  const getInitialThemeColor = () => {
    const params = getUrlParams();
    return params.get('theme-color') || '#001096';
  };

  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false);

  const debugPanelBtn = (
    <button
      onClick={() => setIsDebugPanelVisible(true)}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        fontSize: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2px',
      }}
      title="Open Debug Panel"
    >
      <div>🐛</div>
      <div style={{ fontSize: '8px' }}>DEBUG</div>
    </button>
  );

  const debugPanel = (
    <DebugPanel
      isVisible={isDebugPanelVisible}
      onClose={() => setIsDebugPanelVisible(false)}
    />
  );

  // Check if we should render in direct mode (for Cypress tests)
  const isDirect = getUrlParams().get('direct') === 'true';

  // If direct mode, render only the component without development UI
  if (isDirect) {
    const component = getInitialComponent();
    const themeColor = getInitialThemeColor();
    const params = getUrlParams();

    const props: Record<string, any> = {
      key: `${component}-${themeColor}`,
      'show-navigation': true,
      'theme-color': themeColor,
    };

    const systemParams = ['component', 'direct', 'theme-color'];
    Array.from(params.entries()).forEach(([key, value]) => {
      if (!systemParams.includes(key)) {
        if (value === '' || value === 'true') {
          props[key] = true;
        } else if (value === 'false') {
          props[key] = false;
        } else {
          props[key] = value;
        }
      }
    });

    let componentElement;
    switch (component) {
      case 'document-capture':
        componentElement = createElement('document-capture-screens', props);
        break;
      case 'selfie-capture':
        componentElement = createElement('selfie-capture-screens', props);
        break;
      case 'smartselfie-capture':
        componentElement = createElement('smartselfie-capture', props);
        break;
      case 'smart-camera-web':
      default:
        componentElement = createElement('smart-camera-web', props);
    }

    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: 360,
            maxWidth: '100%',
            background: '#fff',
            color: '#213547',
          }}
        >
          {componentElement}
          {debugPanelBtn}
          {debugPanel}
        </div>
      </div>
    );
  }

  // Form state (what user is currently selecting)
  const [formComponent, setFormComponent] = useState(getInitialComponent());
  const [formThemeColor, setFormThemeColor] = useState(getInitialThemeColor());

  // Rendered component state (what's actually displayed)
  const [component, setComponent] = useState(getInitialComponent());
  const [themeColor, setThemeColor] = useState(getInitialThemeColor());

  // Update state when URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const newComponent = getInitialComponent();
      const newThemeColor = getInitialThemeColor();
      setComponent(newComponent);
      setThemeColor(newThemeColor);
      setFormComponent(newComponent);
      setFormThemeColor(newThemeColor);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    // Update the rendered component state
    setComponent(formComponent);
    setThemeColor(formThemeColor);

    // Update URL search parameters
    const params = new URLSearchParams();
    params.set('component', formComponent);
    if (formThemeColor !== '#001096') {
      params.set('theme-color', formThemeColor);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const renderComponent = () => {
    const props = {
      key: `${component}-${themeColor}`,
      'show-navigation': true,
      'theme-color': themeColor,
    };

    switch (component) {
      case 'document-capture':
        return createElement('document-capture-screens', props);
      case 'selfie-capture':
        return createElement('selfie-capture-screens', props);
      case 'smartselfie-capture':
        return createElement('smartselfie-capture', props);
      case 'smart-camera-web':
      default:
        return createElement('smart-camera-web', props);
    }
  };

  return (
    <>
      <h1>SmileID Web Components Development</h1>

      <form onSubmit={handleSubmit} className="controls">
        <div>
          <label htmlFor="component-select">Component:</label>
          <select
            id="component-select"
            value={formComponent}
            onChange={(e) =>
              setFormComponent((e.target as HTMLSelectElement).value)
            }
          >
            <option value="smart-camera-web">Smart Camera Web</option>
            <option value="document-capture">Document Capture</option>
            <option value="selfie-capture">Selfie Capture</option>
            <option value="smartselfie-capture">
              Enhanced Selfie Capture (Standalone)
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="theme-color">Theme Color:</label>
          <input
            id="theme-color"
            type="color"
            value={formThemeColor}
            onChange={(e) =>
              setFormThemeColor((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div>
          <button type="submit">Update Component</button>
        </div>
      </form>

      <div className="component-container">{renderComponent()}</div>
      {debugPanelBtn}
      {debugPanel}
    </>
  );
};

export default App;
