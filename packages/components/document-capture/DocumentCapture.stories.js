import "./index";

const meta = {
    component: "document-capture",
};

export default meta;

export const DocumentCapture = {
    render: () => `
        <document-capture
		>
        </document-capture>
    `,
}

export const DocumentCaptureHiddenInstructions = {
    render: () => `
        <document-capture
			hide-instructions
		>
        </document-capture>
    `,
}

export const DocumentCaptureHideBackOfId = {
    render: () => `
        <document-capture
			hide-back-of-id
		>
        </document-capture>
    `,
}