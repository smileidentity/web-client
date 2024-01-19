import "./SelfieReview";

const meta = {
    component: "selfie-review",
};

export default meta;

export const SelfieReview = {
    render: () => `
        <selfie-review
            show-navigation
            data-image="https://placehold.co/600x400"
        >
        </selfie-review>
    `,
}