import "./index";

const meta = {
    component: "selfie-instruction",
};

export default meta;

export const SelfieInstruction = {
    render: () => `
        <selfie-instruction
            show-navigation
            selfie-capture-modes="camera,upload"
        >
        </selfie-instruction>
    `,
}