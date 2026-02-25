describe('id_info - Biometric KYC', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('should skip selection and input screens when all data is valid', () => {
    cy.visit('/biometric_kyc_id_info_complete');

    cy.loadIDOptions();

    // Selection screen should be skipped
    cy.getIFrameBody().find('#country').should('not.be.visible');
    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    // Should go straight to camera (skipping selection)
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be skipped — should go straight to upload
    cy.getIFrameBody().find('#id-info').should('not.be.visible');

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'Bank Verification');
  });

  it('should show input screen with locked valid fields and editable missing fields', () => {
    cy.visit('/biometric_kyc_id_info_partial');

    cy.loadIDOptions();

    // Selection screen should be skipped
    cy.getIFrameBody().find('#country').should('not.be.visible');

    // Should go to camera
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be shown (partial data — DRIVERS_LICENSE needs id_number, first_name, last_name, dob)
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // id_number should be pre-filled and locked
    cy.getIFrameBody()
      .find('#id_number')
      .should('have.value', 'ABC123456789')
      .should('have.attr', 'readonly');
    cy.getIFrameBody().find('#id_number').should('have.class', 'locked-field');

    // first_name should be pre-filled and locked
    cy.getIFrameBody()
      .find('#first_name')
      .should('have.value', 'John')
      .should('have.attr', 'readonly');
    cy.getIFrameBody().find('#first_name').should('have.class', 'locked-field');

    // last_name should be empty and editable (missing)
    cy.getIFrameBody()
      .find('#last_name')
      .should('have.value', '')
      .should('not.have.attr', 'readonly');

    // dob fields should be empty and editable (missing)
    cy.getIFrameBody()
      .find('#day')
      .should('have.value', '')
      .should('not.have.attr', 'readonly');

    // Fill in missing fields and submit
    cy.getIFrameBody().find('#last_name').type('Doe');
    cy.getIFrameBody().find('#day').type('15');
    cy.getIFrameBody().find('#month').type('03');
    cy.getIFrameBody().find('#year').type('1990');
    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('should show input screen with invalid field editable and error displayed', () => {
    cy.visit('/biometric_kyc_id_info_invalid');

    cy.loadIDOptions();

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be shown
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // id_number should be pre-filled with invalid value and editable
    cy.getIFrameBody().find('#id_number').should('have.value', '1234');
    cy.getIFrameBody()
      .find('#id_number')
      .should('have.attr', 'aria-invalid', 'true');
    cy.getIFrameBody().find('#id_number').should('not.have.attr', 'readonly');

    // first_name and last_name should be locked
    cy.getIFrameBody()
      .find('#first_name')
      .should('have.value', 'John')
      .should('have.class', 'locked-field');
    cy.getIFrameBody()
      .find('#last_name')
      .should('have.value', 'Doe')
      .should('have.class', 'locked-field');

    // dob fields should be locked
    cy.getIFrameBody()
      .find('#day')
      .should('have.value', '15')
      .should('have.class', 'locked-field');

    // Fix the invalid field and submit
    cy.getIFrameBody().find('#id_number').clear().type('ABC123456789');
    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('should show selection screen when multiple ID types provided', () => {
    cy.visit('/biometric_kyc_id_info_multi');

    cy.loadIDOptions();

    // Selection screen should be shown (multiple ID types)
    cy.getIFrameBody().find('#select-id-type').should('be.visible');

    // Country should be pre-selected and locked
    cy.getIFrameBody().find('#country').should('have.value', 'NG');
    cy.getIFrameBody().find('#country').should('be.disabled');

    // ID types should be available
    cy.getIFrameBody().find('#id_type').select('BVN');
    cy.getIFrameBody().find('#submitConfig').click();

    // Should proceed to camera
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');
  });

  it('should still work with id_selection (backward compat)', () => {
    cy.visit('/biometric_kyc_pre_select_id_type');

    cy.loadIDOptions();

    // Should skip selection (id_selection with 1 country + 1 type)
    cy.getIFrameBody().find('#country').should('not.be.visible');
    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    // Should go to camera
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');
  });
});

describe('id_info - strict mode', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('strict:false — should skip input screen when fields are invalid (not missing)', () => {
    cy.visit('/biometric_kyc_id_info_strict_false_invalid');

    cy.loadIDOptions();

    // Selection screen should be skipped (1 country + 1 id type)
    cy.getIFrameBody().find('#country').should('not.be.visible');
    cy.getIFrameBody().find('#id_type').should('not.be.visible');

    // Should go to camera
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be skipped — invalid id_number but strict:false
    cy.getIFrameBody().find('#id-info').should('not.be.visible');

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('strict:false — should still show input screen when fields are missing', () => {
    cy.visit('/biometric_kyc_id_info_strict_false_missing');

    cy.loadIDOptions();

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be shown — missing last_name and dob even though strict:false
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // id_number and first_name should be locked (valid provided fields)
    cy.getIFrameBody()
      .find('#id_number')
      .should('have.value', 'ABC123456789')
      .should('have.attr', 'readonly');
    cy.getIFrameBody()
      .find('#first_name')
      .should('have.value', 'John')
      .should('have.attr', 'readonly');

    // last_name should be empty and editable (missing)
    cy.getIFrameBody()
      .find('#last_name')
      .should('have.value', '')
      .should('not.have.attr', 'readonly');

    // dob fields should be empty and editable (missing)
    cy.getIFrameBody()
      .find('#day')
      .should('have.value', '')
      .should('not.have.attr', 'readonly');

    // Fill in missing fields and submit
    cy.getIFrameBody().find('#last_name').type('Doe');
    cy.getIFrameBody().find('#day').type('15');
    cy.getIFrameBody().find('#month').type('03');
    cy.getIFrameBody().find('#year').type('1990');
    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('strict:true — should show input screen when fields are invalid', () => {
    cy.visit('/biometric_kyc_id_info_strict_true_invalid');

    cy.loadIDOptions();

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    // Input screen should be shown — strict:true (default behavior) and id_number is invalid
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // id_number should be pre-filled with invalid value and editable
    cy.getIFrameBody().find('#id_number').should('have.value', '1234');
    cy.getIFrameBody()
      .find('#id_number')
      .should('have.attr', 'aria-invalid', 'true');
    cy.getIFrameBody().find('#id_number').should('not.have.attr', 'readonly');

    // Valid fields should be locked
    cy.getIFrameBody()
      .find('#first_name')
      .should('have.value', 'John')
      .should('have.class', 'locked-field');
    cy.getIFrameBody()
      .find('#last_name')
      .should('have.value', 'Doe')
      .should('have.class', 'locked-field');
    cy.getIFrameBody()
      .find('#day')
      .should('have.value', '15')
      .should('have.class', 'locked-field');

    // Fix the invalid field and submit
    cy.getIFrameBody().find('#id_number').clear().type('ABC123456789');
    cy.getIFrameBody().find('#submitForm').click();

    cy.wait('@getUploadURL');
    cy.wait('@successfulUpload');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
  });

  it('strict:false — should still validate when user fills form manually (no id_info data)', () => {
    cy.visit('/biometric_kyc_id_info_strict_false_no_data');

    cy.loadIDOptions();

    // Selection screen should be shown (no country/type provided)
    cy.getIFrameBody().find('#select-id-type').should('be.visible');

    // Select country and ID type manually
    cy.getIFrameBody().find('#country').select('NG');
    cy.getIFrameBody().find('#id_type').select('DRIVERS_LICENSE');
    cy.getIFrameBody().find('#submitConfig').click();

    // Should go to camera
    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

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

    cy.navigateThroughCameraScreens();

    // Input screen should be shown (user fills form manually)
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // Submit with empty fields — validation should block even though strict:false
    cy.getIFrameBody().find('#submitForm').click();

    // Should NOT proceed to upload — form should still be visible with validation errors
    cy.getIFrameBody().find('#id-info').should('be.visible');
    cy.getIFrameBody().find('#complete-screen').should('not.be.visible');
  });

  it('strict:false — should validate when user edits form after partial id_info prefill', () => {
    cy.visit('/biometric_kyc_id_info_strict_false_missing');

    cy.loadIDOptions();

    cy.getIFrameBody().find('smart-camera-web').should('be.visible');

    cy.navigateThroughCameraScreens();

    // Input screen should be shown — missing last_name and dob
    cy.getIFrameBody().find('#id-info').should('be.visible');

    // Submit without filling missing fields — validation should block
    cy.getIFrameBody().find('#submitForm').click();

    // Should NOT proceed — form should still be visible
    cy.getIFrameBody().find('#id-info').should('be.visible');
    cy.getIFrameBody().find('#complete-screen').should('not.be.visible');
  });
});

describe('id_info - Enhanced KYC', () => {
  beforeEach(() => {
    cy.loadIDOptions();
  });

  it('should skip selection and input screens when all data is valid', () => {
    cy.visit('/ekyc_id_info_complete');

    cy.loadIDOptions();

    // Selection screen should be skipped
    cy.getIFrameBody().find('#country').should('not.be.visible');
    cy.getIFrameBody().find('#id_type').should('not.be.visible');

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

    // Input screen should be skipped — goes straight to submission
    cy.getIFrameBody().find('#id-info').should('not.be.visible');

    cy.wait('@submitEnhancedKYC');

    cy.getIFrameBody().find('#complete-screen').should('be.visible');
    cy.getIFrameBody()
      .find('#thank-you-message')
      .should('be.visible')
      .should('contain', 'Nigeria')
      .should('contain', 'National ID');
  });
});
