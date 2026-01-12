import SmartCamera from '../../domain/camera/src/SmartCamera';
import styles from '../../styles/src/styles';
import '../attribution/PoweredBySmileId';
import '../navigation/src';
import { t, getDirection } from '../../domain/localisation';

function templateString() {
  return `
    ${styles(this.themeColor)}
    <style>
        .camera-permission-screen {
          display: flex;
          flex-direction: column;
          max-block-size: 100%;
          max-inline-size: 40ch;
        }
        .camera-permission {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          margin-top: auto;
          margin-bottom: auto;
        }
        .camera-permission svg {
            flex-shrink: 0;
            margin-inline-end: 2rem;
        }
        .camera-permission p {
            margin-block: 0;
            text-align: center;
        }
    </style>
    <div class='camera-permission-screen flow center' dir='${this.direction}'>
        <smileid-navigation theme-color='${this.themeColor}' ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>
        <div class='flow center'>
          <p class='color-red | center' id='error'>
          </p>
        </div>
        <div class='section | flow camera-permission-wrapper'>
           <div class='center camera-permission'>
                <svg xmlns="http://www.w3.org/2000/svg" width="43" height="33" viewBox="0 0 43 33" fill="none">
                <g clip-path="url(#clip0_658_1399)">
                <path d="M6.36288 7.14178H36.6374C38.1923 7.14178 39.6835 7.7593 40.783 8.85849C41.8824 9.95768 42.5001 11.4485 42.5001 13.003V29.8478C42.5001 30.6838 42.1679 31.4856 41.5766 32.0767C40.9853 32.6679 40.1833 33 39.347 33H6.36288C4.80798 33 3.31676 32.3825 2.21728 31.2833C1.1178 30.1841 0.500122 28.6933 0.500122 27.1388L0.500122 13.003C0.500122 11.4485 1.1178 9.95768 2.21728 8.85849C3.31676 7.7593 4.80798 7.14178 6.36288 7.14178Z" fill="#B2B2B2"/>
                <path d="M10.454 23.1789C10.7438 21.9337 9.96906 20.6893 8.7235 20.3995C7.47794 20.1098 6.23325 20.8843 5.9434 22.1296C5.65355 23.3748 6.4283 24.6191 7.67386 24.9089C8.91942 25.1987 10.1641 24.4241 10.454 23.1789Z" fill="#DBDBC4"/>
                <path d="M10.0768 22.9365C10.2425 21.9024 9.53826 20.9298 8.50389 20.7642C7.46952 20.5985 6.49668 21.3025 6.331 22.3366C6.16532 23.3707 6.86954 24.3433 7.90391 24.509C8.93828 24.6746 9.91112 23.9706 10.0768 22.9365Z" fill="#FF5805"/>
                <path d="M10.9694 16.2784H5.20514C4.83782 16.2784 4.54004 16.576 4.54004 16.9433V18.5194C4.54004 18.8866 4.83782 19.1843 5.20514 19.1843H10.9694C11.3367 19.1843 11.6345 18.8866 11.6345 18.5194V16.9433C11.6345 16.576 11.3367 16.2784 10.9694 16.2784Z" fill="#2D2B2A"/>
                <path d="M37.9183 22.6813C37.9183 19.8492 37.9183 17.0418 37.9429 14.2097C37.9429 11.8948 37.9183 9.57985 37.9676 7.28955C37.5348 7.16853 37.0868 7.11047 36.6374 7.11716H36.0708C36.0954 9.87537 36.1201 12.6089 36.1201 15.3672C36.1201 20.9082 36.1201 26.4739 36.1447 32.0149V32.9754H37.8937C37.8937 29.5522 37.8937 26.1291 37.9183 22.6813Z" fill="#DBDBC4"/>
                <path d="M0.500136 12.9291C0.496683 12.9634 0.500492 12.9981 0.511315 13.0309C0.522139 13.0637 0.539736 13.0938 0.562964 13.1194C0.586192 13.1449 0.614532 13.1653 0.646146 13.1792C0.67776 13.1931 0.71194 13.2002 0.746471 13.2H10.4767C12.8169 13.2 12.1271 11.2545 15.1324 11.2545H41.9582C41.9989 11.2523 42.0385 11.2411 42.0742 11.2215C42.1099 11.2019 42.1408 11.1745 42.1644 11.1414C42.1881 11.1083 42.204 11.0702 42.2109 11.0301C42.2179 10.99 42.2157 10.9488 42.2045 10.9097C41.8333 9.80556 41.125 8.84568 40.1793 8.16529C39.2335 7.48491 38.0981 7.11831 36.933 7.11716H6.31363C5.55019 7.11716 4.79423 7.26749 4.0889 7.55957C3.38358 7.85164 2.7427 8.27975 2.20287 8.81944C1.66304 9.35913 1.23482 9.99983 0.942663 10.705C0.650508 11.4101 0.500136 12.1659 0.500136 12.9291Z" fill="#5E646E"/>
                <path d="M29.7154 1.3791H23.4585C21.4632 1.3791 19.7388 2.48731 19.394 4.01418L18.113 9.45671L18.1623 9.50597H35.0116C35.0362 9.50597 35.0608 9.48134 35.0362 9.45671L33.7799 4.01418C33.4104 2.48731 31.7107 1.3791 29.7154 1.3791Z" fill="#5E646E"/>
                <path d="M30.8977 4.06343V3.71865C30.8977 3.32677 30.742 2.95093 30.4649 2.67382C30.1877 2.39672 29.8117 2.24104 29.4197 2.24104H23.6555C23.2678 2.2475 22.8982 2.40603 22.6263 2.68244C22.3544 2.95885 22.2021 3.331 22.2021 3.71865V4.06343H30.8977Z" fill="#2D2B2A"/>
                <path d="M14.0731 4.72836H6.70771C6.4084 4.72836 6.16577 4.97093 6.16577 5.27015V6.63695C6.16577 6.93617 6.4084 7.17874 6.70771 7.17874H14.0731C14.3724 7.17874 14.615 6.93617 14.615 6.63695V5.27015C14.615 4.97093 14.3724 4.72836 14.0731 4.72836Z" fill="#2D2B2A"/>
                <path d="M8.99862 8.76717H7.12648C6.73194 8.76717 6.41211 9.08692 6.41211 9.48135V11.0181C6.41211 11.4125 6.73194 11.7322 7.12648 11.7322H8.99862C9.39315 11.7322 9.71299 11.4125 9.71299 11.0181V9.48135C9.71299 9.08692 9.39315 8.76717 8.99862 8.76717Z" fill="#FCFCFC"/>
                <path d="M8.77703 10.2448C8.77709 10.1521 8.75846 10.0604 8.72227 9.97507C8.68608 9.88977 8.63306 9.81263 8.56638 9.74827C8.4997 9.6839 8.42073 9.63363 8.33418 9.60047C8.24763 9.5673 8.15529 9.55191 8.06266 9.55522C7.97208 9.55522 7.88239 9.57305 7.79871 9.60771C7.71503 9.64236 7.63899 9.69315 7.57494 9.75718C7.5109 9.82121 7.46009 9.89723 7.42543 9.98089C7.39076 10.0646 7.37292 10.1542 7.37292 10.2448C7.37281 10.43 7.44469 10.608 7.57338 10.7413C7.70206 10.8745 7.8775 10.9526 8.06266 10.9589C8.25212 10.9589 8.43382 10.8837 8.56779 10.7498C8.70176 10.6158 8.77703 10.4342 8.77703 10.2448Z" fill="#5E646E"/>
                <path d="M26.9318 30.0202C33.7069 30.0202 39.1992 24.5293 39.1992 17.756C39.1992 10.9827 33.7069 5.49179 26.9318 5.49179C20.1566 5.49179 14.6643 10.9827 14.6643 17.756C14.6643 24.5293 20.1566 30.0202 26.9318 30.0202Z" fill="#FCFCFC"/>
                <path d="M26.9319 28.3455C32.7819 28.3455 37.5242 23.6044 37.5242 17.756C37.5242 11.9075 32.7819 7.16641 26.9319 7.16641C21.0818 7.16641 16.3395 11.9075 16.3395 17.756C16.3395 23.6044 21.0818 28.3455 26.9319 28.3455Z" fill="#0A462F"/>
                <path d="M26.9318 24.0358C30.401 24.0358 33.2133 21.2242 33.2133 17.756C33.2133 14.2877 30.401 11.4761 26.9318 11.4761C23.4626 11.4761 20.6503 14.2877 20.6503 17.756C20.6503 21.2242 23.4626 24.0358 26.9318 24.0358Z" fill="#2D2B2A"/>
                <path opacity="0.49" d="M28.4098 19.1104C30.1376 19.1104 31.5383 17.7102 31.5383 15.9828C31.5383 14.2555 30.1376 12.8552 28.4098 12.8552C26.682 12.8552 25.2814 14.2555 25.2814 15.9828C25.2814 17.7102 26.682 19.1104 28.4098 19.1104Z" fill="url(#paint0_linear_658_1399)"/>
                <g style="mix-blend-mode:screen" opacity="0.24">
                    <path d="M30.9717 14.6776C30.9717 14.9977 30.8445 15.3046 30.6182 15.5309C30.3918 15.7572 30.0848 15.8843 29.7647 15.8843C29.4445 15.8843 29.1375 15.7572 28.9112 15.5309C28.6848 15.3046 28.5576 14.9977 28.5576 14.6776C28.5576 14.5203 28.589 14.3645 28.6499 14.2195C28.7109 14.0744 28.8002 13.943 28.9126 13.8329C29.025 13.7228 29.1583 13.6363 29.3046 13.5783C29.4509 13.5204 29.6073 13.4922 29.7647 13.4955C29.922 13.4922 30.0784 13.5204 30.2247 13.5783C30.371 13.6363 30.5043 13.7228 30.6167 13.8329C30.7291 13.943 30.8184 14.0744 30.8794 14.2195C30.9403 14.3645 30.9717 14.5203 30.9717 14.6776Z" fill="#00FFFF"/>
                </g>
                </g>
                <defs>
                <linearGradient id="paint0_linear_658_1399" x1="25.2617" y1="15.9804" x2="31.5383" y2="15.9804" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#7F47DD" stop-opacity="0.1"/>
                    <stop offset="0.99" stop-color="#00FFFF"/>
                </linearGradient>
                <clipPath id="clip0_658_1399">
                    <rect width="42" height="33" fill="white" transform="translate(0.500122)"/>
                </clipPath>
                </defs>
            </svg>
            <p class='text-2xl font-bold'>${t('camera.permission.description')}</p>
            <div class='flow action-buttons'>
                <button data-variant='solid full-width' class='button' type='button' id='request-camera-access'>
                  ${t('camera.permission.requestButton')}
                </button>
                ${this.hideAttribution ? '' : '<powered-by-smile-id></powered-by-smile-id>'}
            </div>
          </div>
        </div>
    </div>
    `;
}

class CameraPermission extends HTMLElement {
  connectedCallback() {
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.render();
    this.setUpEventListeners();
  }

  setUpEventListeners() {
    const errorMessage = this.shadowRoot.querySelector('#error');
    const permissionButton = this.shadowRoot.getElementById(
      'request-camera-access',
    );
    errorMessage.textContent = '';
    permissionButton.addEventListener('click', async () => {
      permissionButton.setAttribute('disabled', true);
      try {
        await SmartCamera.getMedia({
          audio: false,
          video: true,
        });
        this.dispatchEvent(new CustomEvent('camera-permission.granted'));
      } catch (error) {
        this.dispatchEvent(
          new CustomEvent('camera-permission.denied', { detail: error }),
        );
        errorMessage.textContent = SmartCamera.handleCameraError(error);
      }
      permissionButton.removeAttribute('disabled');
    });
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation');
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution');
  }

  get hideBack() {
    return this.hasAttribute('hide-back');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#001096';
  }

  get direction() {
    return this.getAttribute('dir') || getDirection() || 'ltr';
  }
}

if (window.customElements && !window.customElements.get('camera-permission')) {
  window.customElements.define('camera-permission', CameraPermission);
}

export default CameraPermission;
