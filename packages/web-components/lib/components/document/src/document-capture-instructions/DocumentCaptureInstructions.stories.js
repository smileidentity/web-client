import './index';
import { setCurrentLocale } from '../../../../domain/localisation';

const meta = {
  args: {
    'theme-color': '#001096',
    language: 'en',
  },
  argTypes: {
    'theme-color': { control: 'color' },
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
  },
  component: 'document-capture-instructions',
};

export default meta;

export const DocumentInstruction = {
  render: (args) => {
    setCurrentLocale(args.language);
    return `
        <document-capture-instructions
            show-navigation
            document-capture-modes="camera,upload"
            theme-color='${args['theme-color']}'
        >
        </document-capture-instructions>
    `;
  },
};
