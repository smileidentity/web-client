import './SelfieCaptureReview';

const meta = {
  argTypes: {
    'theme-color': { control: 'color' },
  },
  component: 'selfie-capture-review',
};

export default meta;

export const SelfieCaptureReview = {
  args: {
    'theme-color': '#001096',
  },
  render: (args) => `
        <selfie-capture-review
            show-navigation
            data-image="https://placehold.co/600x400"
            theme-color='${args['theme-color']}'
        >
        </selfie-capture-review>
    `,
};
