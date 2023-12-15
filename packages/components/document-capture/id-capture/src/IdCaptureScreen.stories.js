import "./index";

const meta = {
    component: "id-capture",
};

export default meta;


export const IdCaptureScreen = {
    render: () => `
        <id-capture
            show-navigation
            document-capture-modes="camera,upload"
        >
        </id-capture>
    `,
}