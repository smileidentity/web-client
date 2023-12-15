class Router {
	static activeScreen = null;

	static setActiveScreen(screen) {
		if (Router.activeScreen) {
			Router.activeScreen.setAttribute('hidden', '');
		}
		screen.removeAttribute('hidden');
		Router.activeScreen = screen;
	}
}

export { Router };