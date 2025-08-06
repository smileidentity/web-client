describe('No ID Selection', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('basic_kyc', () => {
    cy.visit('/basic_kyc');

    cy.selectNINIDType();

    cy.intercept(
      {
        method: 'POST',
        url: '*v2/verify*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitBasicKYC');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitBasicKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });

  it('biometric_kyc', () => {
    cy.visit('/biometric_kyc');

    cy.selectBVNIDType();

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().get('#id_number-hint').should('not.exist');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL')
      .its('request.body')
      .should((body) => {
        const metadata = {};
        body.metadata.forEach(({ name, value }) => {
          metadata[name] = value;
        });
        expect(metadata.browser_version).to.match(/^\d+(\.\d+)+$/);
        expect(metadata.selfie_image_origin).to.equal('front_camera');
        expect(metadata.active_liveness_type).to.equal('smile');
        expect(metadata.active_liveness_version).to.equal('0.0.1');
        expect(metadata.fingerprint).to.be.a('string');
        expect(metadata.user_agent).to.be.a('string');
        expect(metadata.camera_name).to.be.a('string');
        expect(Number(metadata.selfie_capture_duration_ms)).to.be.greaterThan(
          0,
        );
      });

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'Bank Verification');
  });

  it('document_verification', () => {
    cy.visit('/document-verification');

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.selectPASSPORTIDType();

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'PASSPORT');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .shadow()
      .find('#take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image', { timeout: 10000 })
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('not.be.visible');

    cy.wait('@getUploadURL');

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('enhanced_kyc', () => {
    cy.visit('/enhanced_kyc');

    cy.selectNINIDType();

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.intercept(
      {
        method: 'POST',
        url: '*v1/async_id_verification*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitEnhancedKYC');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitEnhancedKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });
});

describe('Preselected Country', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('basic_kyc', () => {
    cy.visit('/basic_kyc_pre_select_country');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('contain', 'Nigeria');

    cy.getIFrameBody().find('#id_type').select('NIN');

    cy.getIFrameBody().find('#submitConfig').click();

    cy.intercept(
      {
        method: 'POST',
        url: '*v2/verify*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitBasicKYC');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitBasicKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });

  it('biometric_kyc', () => {
    cy.visit('/biometric_kyc_pre_select_country');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('contain', 'Nigeria');

    cy.getIFrameBody().find('#id_type').select('BVN');

    cy.getIFrameBody().find('#submitConfig').click();

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().get('#id_number-hint').should('not.exist');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'Bank Verification');
  });

  it('should have the correct country and id_types if IDENTITY CARD is pre-selected', () => {
    cy.visit('/document-verification-za');

    cy.loadIDOptions();
    cy.getIFrameBody().find('#country').should('contain', 'South Africa');

    cy.getIFrameBody().find('smileid-combobox-trigger > button').click();

    cy.getIFrameBody()
      .find('smileid-combobox-option[value="IDENTITY_CARD__Identity Card"]')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smileid-combobox-option[value="IDENTITY_CARD__Green Book"]')
      .should('be.visible');
  });

  it('document_verification', () => {
    cy.visit('/document-verification-pre-select-country');

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('contain', 'Nigeria');

    cy.getIFrameBody().find('smileid-combobox-trigger > button').click();

    cy.getIFrameBody()
      .find('smileid-combobox-option[value="PASSPORT__Passport"]')
      .click();

    cy.getIFrameBody().find('#submitConfig').click();

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'PASSPORT');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .shadow()
      .find('#take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image', { timeout: 10000 })
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('not.be.visible');

    cy.wait('@getUploadURL');

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('enhanced_kyc', () => {
    cy.visit('/enhanced_kyc_pre_select_country');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('contain', 'Nigeria');

    cy.getIFrameBody().find('#id_type').select('NIN');

    cy.getIFrameBody().find('#submitConfig').click();

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.intercept(
      {
        method: 'POST',
        url: '*v1/async_id_verification*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitEnhancedKYC');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitEnhancedKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });
});

describe('Preselected Country and ID Type', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('basic_kyc', () => {
    cy.visit('/basic_kyc_pre_select_id_type');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('not.be.visible');

    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().find('#back-button').should('not.be.visible');

    cy.intercept(
      {
        method: 'POST',
        url: '*v2/verify*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitBasicKYC');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitBasicKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });

  it('biometric_kyc', () => {
    cy.visit('/biometric_kyc_pre_select_id_type');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('not.be.visible');

    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .find('#back-button-exit')
      .should('not.be.exist');

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().get('#id_number-hint').should('not.exist');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'Bank Verification');
  });

  it('document_verification', () => {
    cy.visit('/document-verification-pre-select-id-type');

    cy.intercept(
      {
        method: 'POST',
        url: '*upload*',
      },
      {
        upload_url:
          'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
    ).as('getUploadURL');

    cy.intercept(
      {
        method: 'PUT',
        url: 'https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip',
      },
      {
        statusCode: 200,
      },
    ).as('successfulUpload');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#id_type').should('not.exist');

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .find('#back-button-exit')
      .should('not.be.exist');
    cy.navigateThroughCameraScreens();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .invoke('attr', 'document-type')
      .should('eq', 'PASSPORT');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .shadow()
      .find('#take-photo')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-instructions#document-capture-instructions-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .shadow()
      .find('#capture-id-image', { timeout: 10000 })
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture#document-capture-front')
      .should('not.be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('be.visible');

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .shadow()
      .find('#select-id-image')
      .click();

    cy.getIFrameBody()
      .find('smart-camera-web')
      .shadow()
      .find('document-capture-review#front-of-document-capture-review')
      .should('not.be.visible');

    cy.wait('@getUploadURL');

    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('enhanced_kyc', () => {
    cy.visit('/enhanced_kyc_pre_select_id_type');

    cy.loadIDOptions();

    cy.getIFrameBody().find('#country').should('not.be.visible');

    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.getIFrameBody().find('#back-button').should('not.be.visible');

    cy.getIFrameBody().find('#id-info').should('be.visible');

    cy.intercept(
      {
        method: 'POST',
        url: '*v1/async_id_verification*',
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as('submitEnhancedKYC');

    cy.getIFrameBody().find('#id_number').type('12345678901');

    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@submitEnhancedKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');

    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });
});
