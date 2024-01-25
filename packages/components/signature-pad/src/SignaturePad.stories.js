import './SignaturePad';

const meta = {
  component: 'smileid-signature-pad',
};

export default meta;

export const SignaturePad = {
  render: () => `
        <smileid-signature-pad
        >
        </smileid-signature-pad>
    `,
};

export const SignaturePadWithUploads = {
  render: () => `
        <smileid-signature-pad
          allow-upload
        >
        </smileid-signature-pad>
    `,
};
