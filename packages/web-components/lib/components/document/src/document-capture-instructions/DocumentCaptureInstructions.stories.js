import './index';
import {
  getDirection,
  setCurrentLocale,
} from '../../../../domain/localisation';

const meta = {
  args: {
    'document-type': 'National ID',
    'hide-attribution': false,
    'hide-back': false,
    language: 'en',
    variant: 'v2',
  },
  argTypes: {
    'document-type': { control: 'text' },
    'hide-attribution': { control: 'boolean' },
    'hide-back': { control: 'boolean' },
    'hide-back-to-host': { control: 'boolean' },
    language: {
      control: { type: 'select' },
      options: ['en', 'fr', 'ar'],
    },
    title: { control: 'text' },
    variant: {
      control: { type: 'inline-radio' },
      description:
        'Switch between the legacy <document-capture-instructions> and the new <document-capture-instructions-v2>.',
      options: ['legacy', 'v2'],
    },
  },
  component: 'document-capture-instructions-v2',
  parameters: {
    layout: 'centered',
  },
  title: 'Document/DocumentCaptureInstructions',
};

export default meta;

const tagFor = (variant) =>
  variant === 'legacy'
    ? 'document-capture-instructions'
    : 'document-capture-instructions-v2';

const buildAttrs = (args) =>
  Object.entries(args)
    .map(([key, val]) => {
      if (key === 'language' || key === 'variant') return '';
      if (val === false || val === '' || val == null) return '';
      if (val === true) return key;
      return `${key}="${val}"`;
    })
    .filter(Boolean)
    .join(' ');

const renderComponent = (args) => {
  setCurrentLocale(args.language);

  const attrs = buildAttrs(args);
  const tag = tagFor(args.variant);

  return `
    <div style="width:390px;height:780px;overflow:hidden;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
      <${tag} dir="${getDirection()}" ${attrs} style="display:block;width:100%;height:100%;"></${tag}>
    </div>
  `;
};

export const Default = {
  render: renderComponent,
};

export const Passport = {
  args: {
    'document-type': 'Passport',
  },
  render: renderComponent,
};

export const Greenbook = {
  args: {
    'document-type': 'Greenbook',
  },
  render: renderComponent,
};

export const NoBack = {
  args: {
    'hide-back': true,
  },
  render: renderComponent,
};

export const HideBackToHost = {
  args: {
    'hide-back-to-host': true,
  },
  render: renderComponent,
};

export const NoAttribution = {
  args: {
    'hide-attribution': true,
  },
  render: renderComponent,
};

export const TitleFallback = {
  args: {
    'document-type': '',
    title: 'Document (Front)',
  },
  render: renderComponent,
};

export const DesktopView = {
  render: (args) => {
    setCurrentLocale(args.language);

    const attrs = buildAttrs(args);
    const tag = tagFor(args.variant);

    return `
      <div style="width:640px;height:720px;overflow:hidden;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <${tag} dir="${getDirection()}" ${attrs} style="display:block;width:100%;height:100%;"></${tag}>
      </div>
    `;
  },
};

export const Arabic = {
  args: {
    language: 'ar',
  },
  render: renderComponent,
};

export const Legacy = {
  args: {
    variant: 'legacy',
  },
  render: renderComponent,
};
