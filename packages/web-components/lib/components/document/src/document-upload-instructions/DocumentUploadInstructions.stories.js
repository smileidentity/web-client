import './index';

const meta = {
  title: 'Document/DocumentUploadInstructions',
  component: 'document-upload-instructions',
  args: {
    'id-type': 'National ID',
    'hide-back': false,
    'hide-attribution': false,
  },
  argTypes: {
    'id-type': { control: 'text' },
    'hide-back': { control: 'boolean' },
    'hide-attribution': { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
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
      <document-upload-instructions ${attrs} style="display:block;width:100%;height:100%;"></document-upload-instructions>
    </div>
  `;
};

export const Default = {
  render: renderComponent,
};

export const WithPassport = {
  render: renderComponent,
  args: {
    'id-type': 'Passport',
  },
};

export const NoBack = {
  render: renderComponent,
  args: {
    'hide-back': true,
  },
};

export const NoAttribution = {
  render: renderComponent,
  args: {
    'hide-attribution': true,
  },
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
        <document-upload-instructions ${attrs} style="display:block;width:100%;height:100%;"></document-upload-instructions>
      </div>
    `;
  },
};
