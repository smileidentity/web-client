import "./index";

const meta = {
    component: "document-instruction",
};

export default meta;

export const DocumentInstruction = {
    render: () => `
        <document-instruction
            show-navigation
            document-capture-modes="camera,upload"
        >
        </document->
    `,
}