import './index';

const meta = {
  component: 'document-capture-instructions',
};

export default meta;

export const DocumentInstruction = {
  render: () => `
        <document-capture-instructions
            show-navigation
            document-capture-modes="camera,upload"
        >
        </document-capture-instructions>
    `,
};
