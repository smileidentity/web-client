import './index';

const meta = {
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'document-capture-instructions',
};

export default meta;

export const DocumentInstruction = {
  args: {
    'theme-color': '#d72c2c',
  },
  render: (args) => `
        <document-capture-instructions
            show-navigation
            document-capture-modes="camera,upload"
            theme-color='${args['theme-color']}'
        >
        </document-capture-instructions>
    `,
};
