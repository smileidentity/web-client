import "./SelfieCaptureReview";

const meta = {
  component: "selfie-capture-review",
};

export default meta;

export const SelfieCaptureReview = {
  render: () => `
        <selfie-capture-review
            show-navigation
            data-image="https://placehold.co/600x400"
        >
        </selfie-capture-review>
    `,
};
