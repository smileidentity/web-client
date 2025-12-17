import './index';
import { setCurrentLocale } from '../../../../domain/localisation';

const meta = {
  args: {
    language: 'en',
    'theme-color': '#001096',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['en', 'ar'],
    },
    'theme-color': { control: 'color' },
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
