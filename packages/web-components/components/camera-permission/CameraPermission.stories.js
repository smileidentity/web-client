import './CameraPermission';

const meta = {
  args: {
    'theme-color': '#001096',
  },
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'camera-permission',
};

export default meta;

export const CameraPermission = {
  render: (args) => `
        <camera-permission theme-color='${args['theme-color']}'>
        </camera-permission>
    `,
};

export const CameraPermissionAtributes = {
  render: (args) => `
        <camera-permission theme-color='${args['theme-color']}' show-navigation>
        </camera-permission>
    `,
};
