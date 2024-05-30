import './SmartCameraWeb';

const meta = {
  component: 'smart-camera-web',
};

export default meta;

export const SmartCameraWeb = {
  render: () => `
        <smart-camera-web  show-navigation>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutInstructions = {
  render: () => `
        <smart-camera-web hide-instructions>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutNavigation = {
  render: () => `
        <smart-camera-web>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutBackToHost = {
  render: () => `
        <smart-camera-web show-navigation hide-back-to-host>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutBackId = {
  render: () => `
        <smart-camera-web show-navigation hide-back-of-id>
        </smart-camera-web>
    `,
};
