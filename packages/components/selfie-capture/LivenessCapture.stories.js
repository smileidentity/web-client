import "./LivenessCapture";

const meta = {
    component: "liveness-capture",
};

export default meta;

export const LivenessCapture = {
    render: () => `
        <liveness-capture>
        </liveness-capture>
    `,
}

export const LivenessCaptureHiddenInstructions = {
    render: () => `
        <liveness-capture hide-instructions >
        </liveness-capture>
    `,
}
