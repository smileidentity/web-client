import './index';

const meta = {
  args: {
    'document-capture-modes': 'camera,upload',
    'document-type': 'NATIONAL_ID',
    'hide-attribution': false,
    'hide-back-to-host': false,
    'side-of-id': 'Front',
    'theme-color': '#001096',
  },
  argTypes: {
    'document-capture-modes': {
      control: { type: 'select' },
      options: ['camera', 'upload', 'camera,upload'],
    },
    'document-type': {
      control: { type: 'select' },
      options: ['NATIONAL_ID', 'PASSPORT', 'GREEN_BOOK', 'DRIVERS_LICENSE'],
    },
    'hide-attribution': { control: 'boolean' },
    'hide-back-to-host': { control: 'boolean' },
    'side-of-id': {
      control: { type: 'select' },
      options: ['Front', 'Back'],
    },
    'theme-color': { control: 'color' },
  },
  component: 'document-capture',
  parameters: {
    layout: 'centered',
  },
  title: 'Document/DocumentCapture',
};

export default meta;

// Wrap in a phone-sized container so the landscape rotation is visible
const renderComponent = (args) => {
  const attrs = Object.entries(args)
    .map(([key, val]) => {
      if (val === false || val === '' || val == null) return '';
      if (val === true) return key;
      return `${key}="${val}"`;
    })
    .filter(Boolean)
    .join(' ');

  return `
    <div style="width:390px;height:780px;overflow:hidden;border-radius:20px;
                box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);background:#000;">
      <document-capture ${attrs} style="display:block;width:100%;height:100%;"></document-capture>
    </div>
  `;
};

export const IdCard = {
  args: {
    'document-type': 'NATIONAL_ID',
    'side-of-id': 'Front',
  },
  render: renderComponent,
};

export const IdCardBack = {
  args: {
    'document-type': 'NATIONAL_ID',
    'side-of-id': 'Back',
  },
  render: renderComponent,
};

export const Passport = {
  args: {
    'document-type': 'PASSPORT',
    'side-of-id': 'Front',
  },
  render: renderComponent,
};

export const Greenbook = {
  args: {
    'document-type': 'GREEN_BOOK',
    'side-of-id': 'Front',
  },
  render: renderComponent,
};

export const CameraOnly = {
  args: {
    'document-capture-modes': 'camera',
    'document-type': 'NATIONAL_ID',
  },
  render: renderComponent,
};

export const HideAttribution = {
  args: {
    'document-type': 'NATIONAL_ID',
    'hide-attribution': true,
  },
  render: renderComponent,
};
