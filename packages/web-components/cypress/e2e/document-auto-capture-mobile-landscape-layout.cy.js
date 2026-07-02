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

const expectLandscapeEdgeLayout = ({ shouldRotateOverlay }) => {
  getUiOverlay().should(($overlay) => {
    if (shouldRotateOverlay) {
      expect($overlay[0].style.transform).to.contain('rotate(90deg)');
    } else {
      expect($overlay[0].style.transform).not.to.contain('rotate(90deg)');
    }
  });

  cy.get('document-auto-capture')
    .shadow()
    .find('.guide-box')
    .should(($guideBox) => {
      expect($guideBox[0].style.width).to.equal('calc(100% - 16rem)');
    });

  cy.get('document-auto-capture')
    .shadow()
    .find('button[aria-label="Capture photo"]')
    .parent()
    .should(($buttonWrapper) => {
      expect($buttonWrapper[0].style.right).to.equal('22px');
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
  it('keeps the landscape edge controls when the mobile viewport is portrait', () => {
    cy.viewport(390, 844);
    visitWithMobileUa();
    mountDocumentAutoCapture();

    expectLandscapeEdgeLayout({ shouldRotateOverlay: true });
  });

  it('keeps the landscape edge controls when the mobile viewport is physically landscape', () => {
    cy.viewport(844, 390);
    visitWithMobileUa();
    mountDocumentAutoCapture();

    expectLandscapeEdgeLayout({ shouldRotateOverlay: false });
  });

  it('does not rotate again when a landscape mobile viewport contains a portrait-shaped host', () => {
    cy.viewport(844, 390);
    visitWithMobileUa();
    mountDocumentAutoCapture({ height: '600px', width: '360px' });

    getUiOverlay().should(($overlay) => {
      expect($overlay[0].style.transform).not.to.contain('rotate(90deg)');
    });
  });
});
