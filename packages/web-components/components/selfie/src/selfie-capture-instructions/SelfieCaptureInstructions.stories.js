import './index';

const meta = {
  argTypes: {
    themeColor: { control: 'color' },
  },
  component: 'selfie-capture-instructions',
};

export default meta;

export const SelfieInstruction = {
  args: {
    themeColor: '#d72c2c',
  },
  render: ({ themeColor }) => `
        <selfie-capture-instructions
            show-navigation
            theme-color=${themeColor}
        >
        </selfie-capture-instructions>
    `,
};
