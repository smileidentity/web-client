import "./Navigation";

const meta = {
    component: "smileid-navigation",
};

export default meta;

export const Navigation = {
    render: () => `
        <smileid-navigation
        >
        </smileid-navigation>
    `,
}

export const NavigationWithBackHidden = {
    render: () => `
        <smileid-navigation
          hide-back
        >
        </smileid-navigation>
    `,
}
