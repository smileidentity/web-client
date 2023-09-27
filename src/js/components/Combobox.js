const generateId = (prefix) => {
	const id = [...Array(30)].map(() => Math.random().toString(36)[3]).join('');
	return `${prefix}-${id}`;
};

// check if element is visible in browser view port
function isElementInView(element) {
	var bounding = element.getBoundingClientRect();

	return (
		bounding.top >= 0 &&
		bounding.left >= 0 &&
		bounding.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		bounding.right <=
			(window.innerWidth || document.documentElement.clientWidth)
	);
}

// check if an element is currently scrollable
function isScrollable(element) {
	return element && element.clientHeight < element.scrollHeight;
}

// ensure a given child element is within the parent's visible scroll area
// if the child is not visible, scroll the parent
function maintainScrollVisibility(activeElement, scrollParent) {
	const { offsetHeight, offsetTop } = activeElement;
	const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

	const isAbove = offsetTop < scrollTop;
	const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

	if (isAbove) {
		scrollParent.scrollTo(0, offsetTop);
	} else if (isBelow) {
		scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
	}
}

class Combobox extends HTMLElement {
	constructor() {
		super();
	}
}

window.customElements.define("smileid-combobox", Combobox);

class ComboboxTrigger extends HTMLElement {
	constructor() {
		super();

		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.toggleExpansionState = this.toggleExpansionState.bind(this);
	}

	get type() {
		return this.getAttribute("type") || "text";
	}

	get label() {
		return this.getAttribute("label") || "";
	}

	get value() {
		return this.getAttribute("value") || "";
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	connectedCallback() {
		if (!this.label) {
			throw new Error("<combobox-trigger>: a label attribute is required");
		}

		this.innerHTML = `${this.type === "text" ?
			`
				<div>
					<input ${this.value ? `value="${this.value}" ` : ''}${this.disabled ? ' disabled ' : ''}type="text" placeholder="${this.label}" />
					<button ${this.disabled ? 'disabled ' : ''}tabindex='-1' type='button'>
						<span class="visually-hidden">Toggle</span>
					</button>
				</div>
			` :
			`<button ${this.disabled ? 'disabled ' : ''}type="button">${this.value || this.label}</button>`
		}`;

		this.setAttribute('expanded', false);

		this.inputTrigger = this.querySelector('input');
		this.buttonTrigger = this.querySelector('button');

		this.buttonTrigger.setAttribute('aria-expanded', false);
		this.buttonTrigger.setAttribute('role', 'combobox');

		this.buttonTrigger.addEventListener('keydown', this.handleKeyDown);
		this.buttonTrigger.addEventListener('click', this.toggleExpansionState);

		if (this.inputTrigger) {
			this.inputTrigger.setAttribute('aria-expanded', false);
			this.inputTrigger.setAttribute('role', 'combobox');

			this.inputTrigger.addEventListener('keydown', this.handleKeyDown);
			this.inputTrigger.addEventListener('keyup', this.handleKeyUp);
			this.inputTrigger.addEventListener('change', (e) => e.stopPropagation());
		}

		this.listbox = this.parentElement.querySelector('smileid-combobox-listbox');

		this.options = Array.from(this.parentElement.querySelectorAll('smileid-combobox-option'));
		this.options.forEach(node => {
			node.addEventListener('Combobox::Option::Select', this.handleSelection);
		});
	}

	disconnectedCallback() {
		this.buttonTrigger.removeEventListener('keydown', this.handleKeyDown);
		this.buttonTrigger.removeEventListener('click', this.toggleExpansionState);

		if (this.inputTrigger) {
			this.inputTrigger.removeEventListener('keydown', this.handleKeyDown)
			this.inputTrigger.removeEventListener('keyup', this.handleKeyUp);
			this.inputTrigger.removeEventListener('change', (e) => e.stopPropagation());
		}

		if (this.options) {
			this.options.forEach(node => {
				node.removeEventListener('Combobox::Option::Select', this.handleSelection);
			});
		}
	}

	handleKeyDown(event) {
		let flag = false;
		let altKey = event.altKey;

		if (event.ctrlKey || event.shiftKey) {
			return;
		}

		const key = event.key;

		switch(key) {
			case "Enter":
			case "Space":
			case " ":
				if (this.getAttribute('expanded') === "true") {
					if (this.inputTrigger && (key === "Space" || key === " ")) {
						this.resetListbox();
					} else {
						event.preventDefault();
						const selectedOption = this.buttonTrigger.getAttribute('aria-activedescendant');
						if (selectedOption) {
							document.getElementById(selectedOption).click();
						}
					}
				} else {
					event.preventDefault();
					this.toggleExpansionState();
				}
				break;
			case "Esc":
			case "Escape":
				event.preventDefault();
				if (this.getAttribute('expanded') === 'true') {
					this.toggleExpansionState();
				}
				break;
			case "Down":
			case "ArrowDown":
				event.preventDefault();
				if (this.getAttribute('expanded') !== "true") {
					this.toggleExpansionState();
					this.focusListbox("First");
				} else {
					this.focusListbox("Down");
				}
				break;
			case "Up":
			case "ArrowUp":
				event.preventDefault();
				if (this.getAttribute('expanded') !== "true") {
					this.toggleExpansionState();
					this.focusListbox("Last")
				} else {
					this.focusListbox("Up");
				}
				break;
			case 'Left':
			case 'ArrowLeft':
			case 'Right':
			case 'ArrowRight':
			case 'Home':
			case 'End':
				this.resetListbox();
				break;
			case "Tab":
				break;
			default:
				break;
		}
	}

	handleKeyUp(event) {
		const key = event.key;

		const isPrintableCharacter = (str) => str.length === 1 && str.match(/\S| /);

		if (event.key === 'Escape' || event.key === 'Esc') {
			event.preventDefault();
			if (this.getAttribute('expanded') === 'true') {
				this.toggleExpansionState();
			} else {
				if (this.inputTrigger) {
					this.inputTrigger.value = "";

					this.listbox.dispatchEvent(
						new CustomEvent(
							"Combobox::Listbox::Filter",
							{ detail: "" }
						)
					);
				}
			}
		}

		if (isPrintableCharacter(key) || key === 'Backspace') {
			this.resetListbox();
			this.filterListbox(event.target.value);
		}
	}

	toggleExpansionState() {
		const listboxIsExpanded = this.getAttribute('expanded') === "true";
		this.setAttribute('expanded', !listboxIsExpanded);
		this.buttonTrigger.setAttribute('aria-expanded', !listboxIsExpanded);
		if (this.inputTrigger) {
			this.inputTrigger.setAttribute('aria-expanded', !listboxIsExpanded);
		}
	}

	handleSelection(event) {
		if (this.inputTrigger) {
			this.inputTrigger.value = event.detail.label;
		} else {
			this.buttonTrigger.textContent = event.detail.label;
		}

		this.toggleExpansionState();
		this.parentElement.dispatchEvent(
			new CustomEvent("change", {
				detail: {
					value: event.detail.value
				}
			})
		);
	}

	filterListbox(value) {
		if (this.getAttribute('expanded') !== 'true') {
			this.toggleExpansionState();
		}

		this.listbox.dispatchEvent(
			new CustomEvent(
				"Combobox::Listbox::Filter",
				{ detail: value }
			)
		);
	}

	focusListbox(direction) {
		this.resetListbox();
		this.listbox.dispatchEvent(
			new CustomEvent("Combobox::Listbox::Focus", {
				detail: {
					direction: direction
				}
			})
		);
	}

	resetListbox() {
		this.listbox.dispatchEvent(
			new CustomEvent("Combobox::Listbox::Reset")
		);
	}
}

window.customElements.define("smileid-combobox-trigger", ComboboxTrigger);

class ComboboxListbox extends HTMLElement {
	constructor() {
		super();

		this.handleFilter = this.handleFilter.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleReset = this.handleReset.bind(this);

		this.handleOptionSelection = this.handleOptionSelection.bind(this);
	}

	get emptyLabel() {
		return this.getAttribute("empty-label");
	}

	get emptyState() {
		return `
			<p id='empty-state' style="text-align: center;">
				${this.emptyLabel || "No items"}
			</p>
		`;
	}

	connectedCallback() {
		this.setAttribute('role', 'listbox');
		this.setAttribute('id', generateId('listbox'));

		this.addEventListener("Combobox::Listbox::Filter", this.handleFilter);
		this.addEventListener("Combobox::Listbox::Focus", this.handleFocus);
		this.addEventListener("Combobox::Listbox::Reset", this.handleReset);

		this.triggers = Array.from(this.parentElement.querySelectorAll("smileid-combobox-trigger input, smileid-combobox-trigger button"));
		this.triggers.forEach(node => node.setAttribute('aria-controls', this.getAttribute('id')));

		this.optionNodes = Array.from(this.querySelectorAll('smileid-combobox-option'));
		this.selectedNode = this.optionNodes.find(node => !node.hasAttribute('hidden') && node.hasAttribute('aria-selected')) || this.optionNodes.filter(node => !node.hasAttribute('hidden'))[0];
		this.selectedNode.setAttribute('tabindex', '0');

		this.optionNodes.forEach(node => {
			node.addEventListener("Combobox::Option::Select", this.handleOptionSelection);
		});

		if (this.optionNodes.length === 0) {
			this.innerHTML = this.emptyState;
		}
	}

	disconnectedCallback() {
		this.removeEventListener('Combobox::Listbox::Filter', this.handleFilter);
		this.removeEventListener('Combobox::Listbox::Focus', this.handleFocus);
		this.removeEventListener('Combobox::Listbox::Reset', this.handleReset);
		this.optionNodes.forEach(node => {
			node.removeEventListener("Combobox::Option::Select", this.handleOptionSelection);
		});
	}

	static get observedAttributes() {
		return [ "search-term" ];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "search-term":
				if (oldValue && !newValue) {
					this.optionNodes.forEach(node => {
						node.removeAttribute("hidden");
					});
				} else if (newValue) {
					this.filterNodes(newValue);
				}
				break;
			default:
				break;
		}
	}

	filterNodes(searchTerm) {
		this.optionNodes.forEach(node => {
			const value = node.getAttribute("value").toLowerCase();
			const label = node.getAttribute("label").toLowerCase();

			const containsSearchTerm = value.includes(searchTerm.toLowerCase()) || label.includes(searchTerm.toLowerCase());

			if (containsSearchTerm) {
				node.removeAttribute("hidden");
			} else {
				node.setAttribute("hidden", true);
			}
		});

		const optionsVisible = this.optionNodes.find(node => !node.hasAttribute('hidden'));
		const emptyState = this.querySelector('#empty-state');

		if (!optionsVisible && !emptyState) {
			this.insertAdjacentHTML('afterbegin', this.emptyState);
		} else if (optionsVisible && emptyState) {
			this.removeChild(emptyState);
		}
	}

	handleFilter(event) {
		const searchTerm = event.detail;
		this.setAttribute('search-term', searchTerm);
	}

	handleFocus(event) {
		this.setSelected(event.detail.direction);
	}

	handleReset(event) {
		this.optionNodes.forEach(node => node.setAttribute('tabindex', '-1'));
	}

	handleOptionSelection(event) {
		const inputTrigger = this.triggers.filter(node => node.tagName === "INPUT")[0];

		if (this.inputTrigger) {
			this.setAttribute('search-term', event.detail.label);
		}
	}

	setSelected(direction) {
		const visibleOptions = this.optionNodes.filter(node => !node.hasAttribute('hidden'));
		this.selectedNode.setAttribute('tabindex', '0');
		const currentIndex = visibleOptions.findIndex(node => node === this.selectedNode);
		const lastIndex = visibleOptions.length - 1;

		let nextIndex;
		switch(direction) {
			case 'First':
				nextIndex = 0;
				break;
			case 'Last':
				nextIndex = lastIndex;
				break;
			case 'Up':
				if (currentIndex === 0) {
					nextIndex = lastIndex;
				} else {
					nextIndex = currentIndex - 1;
				}
				break;
			default:
				if (currentIndex === lastIndex) {
					nextIndex = 0;
				} else {
					nextIndex = currentIndex + 1;
				}
				break;
		}

		if (currentIndex !== nextIndex) {
			this.swapSelected(this.selectedNode, visibleOptions[nextIndex]);
		}
	}

	swapSelected(currentNode, newNode) {
		currentNode.setAttribute('tabindex', '-1');
		newNode.setAttribute('tabindex', '0');

		this.selectedNode = newNode;

		// ACTION: ensure the new option is in view
		if (isScrollable(this)) {
			maintainScrollVisibility(this.selectedNode, this);
		}

		// ACTION: scroll into view if node is not visible
		if (!isElementInView(newNode)) {
			newNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}

		this.triggers.forEach(node => node.setAttribute('aria-activedescendant', newNode.id));
	}
}

window.customElements.define("smileid-combobox-listbox", ComboboxListbox);

class ComboboxOption extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.setAttribute("role", "option");
		this.setAttribute("tabindex", "-1");
		this.setAttribute('id', generateId('option'));

		this.options = Array.from(this.parentElement.querySelectorAll('smileid-combobox-option'));
		this.addEventListener('click', this.select);
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.select);
	}

	get value() {
		return this.getAttribute('value');
	}

	get label() {
		return this.getAttribute('label');
	}

	select() {
		const selectedOption = this.options.find(node => node.getAttribute("aria-selected"));

		if (selectedOption) {
			selectedOption.removeAttribute('aria-selected');
		}

		this.setAttribute('aria-selected', true);

		this.dispatchEvent(
			new CustomEvent("Combobox::Option::Select", {
				detail: {
					label: this.label,
					value: this.value,
					id: this.getAttribute('id')
				}
			})
		);
	}
}

window.customElements.define("smileid-combobox-option", ComboboxOption);
