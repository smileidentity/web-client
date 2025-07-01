import { useState } from 'preact/hooks';
import { createElement } from 'preact';
import '../lib/main';

export function App() {
  // Form state (what user is currently selecting)
  const [formComponent, setFormComponent] = useState('selfie-capture');
  const [formThemeColor, setFormThemeColor] = useState('#001096');

  // Rendered component state (what's actually displayed)
  const [component, setComponent] = useState('selfie-capture');
  const [themeColor, setThemeColor] = useState('#001096');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Update the rendered component when form is submitted
    setComponent(formComponent);
    setThemeColor(formThemeColor);
  };

  const renderComponent = () => {
    const props = {
      'theme-color': themeColor,
      'show-navigation': true,
      // force a rerender
      key: `${component}-${themeColor}`,
    };

    switch (component) {
      case 'document-capture':
        return createElement('document-capture-screens', props);
      case 'selfie-capture':
        return createElement('selfie-capture-screens', props);
      case 'selfie-booth':
        return createElement('selfie-booth', props);
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
            <option value="selfie-booth">Selfie Booth (Standalone)</option>
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
    </>
  );
}
