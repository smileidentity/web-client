describe("zip upload screens", () => {
  beforeEach(() => {
    cy.loadIDOptions();

    cy.visit("/");

    cy.selectNINIDType();

    cy.intercept(
      {
        method: "POST",
        url: "*upload*",
      },
      {
        upload_url:
          "https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip",
      },
    ).as("getUploadURL");

    cy.getIFrameBody().find("end-user-consent").shadow().find("#allow").click();

    cy.navigateThroughCameraScreens();

    cy.getIFrameBody().find("#id-info").should("be.visible");
  });

  describe("when a successful upload happens", () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: "PUT",
          url: "https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip",
        },
        {
          statusCode: 200,
        },
      ).as("successfulUpload");
    });

    it("should show the completion screen", () => {
      cy.getIFrameBody().get("#id_number-hint").should("not.exist");

      cy.getIFrameBody().find("#id_number").type("12345678901");

      cy.getIFrameBody().find("#submitForm").click();

      cy.wait("@getUploadURL");

      cy.wait("@successfulUpload");

      cy.getIFrameBody().find("#complete-screen").should("be.visible");
    });
  });

  describe("when the upload fails", () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: "PUT",
          url: "https://smile-uploads-development01.s3.us-west-2.amazonaws.com/videos/212/212-0000060103-0gdzke3mdtlco5k0sdfh6vifzcrd3n/ekyc_smartselfie.zip",
        },
        {
          statusCode: 412,
        },
      ).as("failedUploadRequest");
    });

    it("should should show the upload failure screen", () => {
      cy.getIFrameBody().find("#id_number").type("12345678901");

      cy.getIFrameBody().find("#submitForm").click();

      cy.getIFrameBody().find("#id-info").should("not.be.visible");

      cy.wait("@getUploadURL");

      cy.wait("@failedUploadRequest");

      cy.getIFrameBody()
        .find("#upload-progress-screen")
        .should("not.be.visible");

      cy.getIFrameBody().find("#upload-failure-screen").should("be.visible");

      cy.getIFrameBody().find("#retry-upload").click();

      cy.wait("@failedUploadRequest");
    });

    it('should should retry upload when "try again" button is clicked', () => {
      cy.getIFrameBody().find("#id_number").type("12345678901");

      cy.getIFrameBody().find("#submitForm").click();

      cy.wait("@getUploadURL");

      cy.wait("@failedUploadRequest");

      cy.getIFrameBody().find("#retry-upload").click();

      cy.wait("@failedUploadRequest");
    });
  });
});
