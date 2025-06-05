import './SmartCameraWeb';

const meta = {
  args: {
    'hide-attribution': false,
    'theme-color': '#001096',
  },
  argTypes: {
    'hide-attribution': { control: 'boolean' },
    'theme-color': { control: 'color' },
  },
  component: 'smart-camera-web',
};

export default meta;

export const SmartCameraWeb = {
  render: (args) => `
        <smart-camera-web theme-color='${args['theme-color']}' capture-id show-navigation ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutInstructions = {
  render: (args) => `
        <smart-camera-web theme-color='${args['theme-color']}' capture-id hide-instructions ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutNavigation = {
  render: (args) => `
        <smart-camera-web theme-color='${args['theme-color']}' capture-id ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutBackToHost = {
  render: (args) => `
        <smart-camera-web theme-color='${args['theme-color']}' capture-id show-navigation hide-back-to-host ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </smart-camera-web>
    `,
};

export const SmartCameraWebWithOutBackId = {
  render: (args) => `
        <smart-camera-web theme-color='${args['theme-color']}' capture-id show-navigation hide-back-of-id ${args['hide-attribution'] ? 'hide-attribution' : ''}>
        </smart-camera-web>
    `,
};

export const SmartCameraWebAgentMode = {
  render: () => `
        <smart-camera-web hide-instructions hide-back-of-id allow-agent-mode='true' show-agent-mode-for-tests>
        </smart-camera-web>
    `,
};
