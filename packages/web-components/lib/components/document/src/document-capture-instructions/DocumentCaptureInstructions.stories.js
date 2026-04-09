import './index';

const meta = {
  args: {
    'hide-attribution': false,
    'hide-back': false,
    'id-type': 'National ID',
  },
  argTypes: {
    'hide-attribution': { control: 'boolean' },
    'hide-back': { control: 'boolean' },
    'hide-back-to-host': { control: 'boolean' },
    'id-type': { control: 'text' },
    title: { control: 'text' },
  },
  component: 'document-capture-instructions',
  parameters: {
    layout: 'centered',
  },
  title: 'Document/DocumentCaptureInstructions',
};

export default meta;

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
    <div style="width:390px;height:780px;overflow:hidden;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
      <document-capture-instructions ${attrs} style="display:block;width:100%;height:100%;"></document-capture-instructions>
    </div>
  `;
};

export const Default = {
  render: renderComponent,
};

export const Passport = {
  args: {
    'id-type': 'Passport',
  },
  render: renderComponent,
};

export const Greenbook = {
  args: {
    'id-type': 'Greenbook',
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
    'id-type': '',
    title: 'Document (Front)',
  },
  render: renderComponent,
};

export const DesktopView = {
  render: (args) => {
    const attrs = Object.entries(args)
      .map(([key, val]) => {
        if (val === false || val === '' || val == null) return '';
        if (val === true) return key;
        return `${key}="${val}"`;
      })
      .filter(Boolean)
      .join(' ');

    return `
      <div style="width:640px;height:720px;overflow:hidden;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <document-capture-instructions ${attrs} style="display:block;width:100%;height:100%;"></document-capture-instructions>
      </div>
    `;
  },
};
