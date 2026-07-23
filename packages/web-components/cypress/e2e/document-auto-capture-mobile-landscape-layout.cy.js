import { stubFakeCamera } from '../support/mediapipeStub';

const mobileUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const mountDocumentAutoCapture = ({
  width = '100vw',
  height = '100vh',
} = {}) => {
  cy.document().then((doc) => {
    doc.body.innerHTML = '';
    doc.body.style.margin = '0';
    doc.body.style.width = '100vw';
    doc.body.style.height = '100vh';

    const host = doc.createElement('document-auto-capture');
    host.setAttribute('document-type', 'id-card');
    host.setAttribute('auto-capture', 'manualCaptureOnly');
    host.style.display = 'block';
    host.style.width = width;
    host.style.height = height;

    doc.body.appendChild(host);
  });
};

const getUiOverlay = () =>
  cy.get('document-auto-capture').shadow().find('.guide-box').parent().parent();

// Landscape document types (id-card/passport) on mobile always use the
// landscape EDGE arrangement (landscape guide, side-mounted capture control).
// The 90° overlay TRANSFORM is applied only when the measured camera box is
// portrait-shaped:
//   • portrait viewport  → transform (the phone is upright; rotate to present
//     the landscape guide) = IMG_4440.
//   • physical landscape → NO transform; the guide is rendered upright natively
//     in the already-landscape box (the phone's own rotation does the work).
// Orientation is read from the measured camera box, not the screen, so an embed
// shell that constrains the box to a portrait card still rotates correctly.
const expectEdgeLayout = ({ transformed }) => {
  getUiOverlay().should(($overlay) => {
    if (transformed) {
      expect($overlay[0].style.transform).to.contain('rotate(90deg)');
    } else {
      expect($overlay[0].style.transform).not.to.contain('rotate(90deg)');
    }
  });

  // The landscape guide (16rem edge inset) is used in both the transformed and
  // native-landscape cases.
  cy.get('document-auto-capture')
    .shadow()
    .find('.guide-box')
    .should(($guideBox) => {
      expect($guideBox[0].style.width).to.equal('calc(100% - 16rem)');
    });

  // Side-mounted capture control (edge arrangement) is present in both cases.
  cy.get('document-auto-capture')
    .shadow()
    .find('button[aria-label="Capture photo"]')
    .parent()
    .should(($buttonWrapper) => {
      expect($buttonWrapper[0].style.right).not.to.equal('');
      expect($buttonWrapper[0].style.bottom).to.equal('');
    });
};

const visitWithMobileUa = () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'userAgent', {
        configurable: true,
        value: mobileUserAgent,
      });
      stubFakeCamera(win);
    },
  });
};

describe('DocumentAutoCapture mobile landscape document layout', () => {
  it('applies the 90° transform in a portrait viewport (= IMG_4440)', () => {
    cy.viewport(390, 844);
    visitWithMobileUa();
    mountDocumentAutoCapture();

    expectEdgeLayout({ transformed: true });
  });

  it('renders the guide upright (no transform) when the camera box is physically landscape', () => {
    cy.viewport(844, 390);
    visitWithMobileUa();
    mountDocumentAutoCapture();

    expectEdgeLayout({ transformed: false });
  });

  it('still transforms when the host box is portrait-shaped in a landscape viewport (embed card)', () => {
    cy.viewport(844, 390);
    visitWithMobileUa();
    mountDocumentAutoCapture({ height: '600px', width: '360px' });

    expectEdgeLayout({ transformed: true });
  });
});
