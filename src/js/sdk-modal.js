"use strict";

const templateString = `
<style>
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
:root {
	--flow-space: 1rem;
}

blockquote, body, dd, dl, figure, h1, h2, h3, h4, p {
  margin: 0
}


html {
    font-family: 'Nunito Sans', sans-serif;
}

[hidden] {
    display: none !important;
}

[disabled] {
    cursor: not-allowed !important;
    filter: grayscale(75%);
}

h1 {
	font-size: 2.25rem;
	font-weight: 600;
}

main {
	width: 100%;
	max-width: 40rem;
	background: #ffffff;
	border-radius: 2rem;
	padding: 2rem;
	overflow-y: scroll;
	position: absolute;
	max-height: 100vh;
}

@media screen and (min-width: 40rem) {
	main {
		/*padding: 2rem 5rem;*/
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
}

@media screen and (min-width: 80rem) {
	main {
		max-height: 80%;
	}
}

.flow {
}

.flow > * + * {
	margin-top: var(--flow-space);
}
.center {
	text-align: center;
}

button[data-type='icon'] {
	align-items: center;
	background-color: transparent;
	border: 0;
	cursor: pointer;
	display: flex;
	padding: 0;
	position: fixed;
	top: 11%;
    right: 5%;
}

.visually-hidden {
	border: 0;
	clip: rect(1px 1px 1px 1px); clip: rect(1px, 1px, 1px, 1px);
	height: auto;
	margin: 0;
	overflow: hidden;
	padding: 0;
	position: absolute;
	white-space: nowrap;
	width: 1px;
}

.credits {
	--flow-space: 2rem;
	color: #636670;
	font-size: .75rem;
}

.company-name {
	text-transform: uppercase;
	letter-spacing: .1rem;
	border-left: 1px solid #cecece;
	margin-left: .75rem;
	padding-left: .75rem;
	display: inline-flex;
	align-items: center;
}

.company-name svg {
	margin-right: .5rem;
}
</style>
<main>
  <button data-type='icon' type='button' id='close-iframe'>
    <svg aria-hidden='true' width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.8748 11.3775L0 21.2523L1.41421 22.6665L11.289 12.7917L21.2524 22.7551L22.6666 21.3409L12.7032 11.3775L22.6665 1.41421L21.2523 0L11.289 9.96328L1.41428 0.0885509L6.76494e-05 1.50276L9.8748 11.3775Z" fill="#BDBDBF"/>
    </svg>
    <span class='visually-hidden'>Close frame</span>
  </button>
  <section class='flow center'>  
    <h1 id="title" class='center font-size-500 max-width:100ch'>
        Select ID Type
    </h1>
    <slot></slot>
    <p id="credits" class='center credits'>
      <span>Powered by:</span>
      <span class='company-name'>
        <svg aria-hidden='true' width="8" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href='#logo-mark' />
        </svg>
        Smile Identity
      </span>
    </p>
  </section>
</main>
`;

class SDKModal extends HTMLElement {
  constructor(props) {
    super(props);
    window.addEventListener(
      "message",
      async (event) => {
        if (event.data.includes("SmileIdentity::HostedWebIntegration")) {
          try {
            var config = JSON.parse(event.data);
            var partner_params = this._getPartnerParams(config);
            localStorage.setItem("SmileIdentityConfig", event.data);
            this.dispatchEvent(
              new CustomEvent("SmileIdentity::ModalInit", {
                detail: { config, partner_params },
              })
            );
          } catch (e) {
            throw e;
          }
        }
      },
      false
    );
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = templateString;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.titleElement = this.shadowRoot.querySelector("#title");
    this.creditsElement = this.shadowRoot.querySelector("#credits");
    this.titleElement.innerHTML = this.title || "Hosted Web SDK";
    this.closeButton = this.shadowRoot.querySelector("#close-iframe");
    this.closeButton.addEventListener("click", (e) => {
      this.dispatchEvent(new CustomEvent("SmileIdentity::ModalClose"));
    });
  }

  static get observedAttributes() {
    return ["title", "showtitle", "showcredit"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);
    switch (name) {
      case "title":
        if (newValue === "undefined" || newValue === "null") {
          this.titleElement.innerHTML = "";
          this.titleElement.setAttribute("hidden", `true`);
        } else {
          this.titleElement.removeAttribute("hidden");
          this.titleElement.innerHTML = newValue;
        }
        break;
      case "showcredit":
        if (newValue === "true") {
          this.creditsElement.removeAttribute("hidden");
        } else {
          this.creditsElement.setAttribute("hidden", `true`);
        }
        break;
      case "showtitle":
        if (newValue === "true") {
          this.titleElement.removeAttribute("hidden");
        } else {
          this.titleElement.setAttribute("hidden", `true`);
        }
        break;
    }
  }

  get title() {
    return this.getAttribute("title");
  }

  get showTitle() {
    return this.getAttribute("showtitle");
  }

  get showCredit() {
    return this.getAttribute("showcredit");
  }

  _parseJWT(token) {
    /**
     * A JSON Web Token (JWT) uses a base64 URL encoded string in it's body.
     *
     * in order to get a regular JSON string, we would follow these steps:
     *
     * 1. get the body of a JWT string
     * 2. replace the base64 URL delimiters ( - and _ ) with regular URL delimiters ( + and / )
     * 3. convert the regular base64 string to a string
     * 4. encode the string from above as a URIComponent,
     *    ref: just above this - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#examples
     * 5. decode the URI Component to a JSON string
     * 6. parse the JSON string to a javascript object
     */
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + c.charCodeAt(0).toString(16);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  _getPartnerParams(config) {
    const { partner_params: partnerParams } = this._parseJWT(config.token);
    return partnerParams;
  }
}

window.customElements.define("sdk-modal", SDKModal);
