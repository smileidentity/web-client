describe("KE Drivers License verification basic kyc", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "POST",
        url: "*v2/verify*",
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as("submitIdVerification");

    cy.loadIDOptions();

    cy.visit("/kra-verification-basic-kyc");

    cy.selectKEDriversLicenseType();
    cy.getIFrameBody().find("end-user-consent").shadow().find("#allow").click();
    cy.getIFrameBody().find("#id-info").should("be.visible");
  });

  it("should show an error message when input is invalid", () => {
    cy.getIFrameBody().get("#id_number-hint").should("not.exist");

    cy.getIFrameBody().find("#submitForm").click();

    cy.getIFrameBody().find("#id_number-hint").should("be.visible");

    cy.getIFrameBody()
      .find("#id_number-hint")
      .should("contain", "Id number is required");
    cy.getIFrameBody().find("#citizenship-hint").should("be.visible");

    cy.getIFrameBody()
      .find("#citizenship-hint")
      .should("contain", "Citizenship is required");

    cy.getIFrameBody().find("#id_number").type("1234567890");

    cy.getIFrameBody().find("#submitForm").click();

    cy.getIFrameBody()
      .find("#id_number-hint")
      .should("contain", "Id number is invalid");
  });

  it("should progress when input is valid", () => {
    cy.getIFrameBody().find("#id_number").type("1234");

    cy.getIFrameBody().find("#citizenship").select("Kenyan");

    cy.getIFrameBody().find("#submitForm").click();
    cy.wait("@submitIdVerification");
  });

  it("should show consent screen for the required id type", () => {
    cy.visit("/kra-verification-basic-kyc");

    cy.selectKEDriversLicenseType();

    cy.getIFrameBody()
      .find("end-user-consent")
      .shadow()
      .find("#consent-screen")
      .should("be.visible");
  });

  it("should show the select id page", () => {
    cy.getIFrameBody().find("#back-button").click();
    cy.getIFrameBody()
      .find("end-user-consent")
      .shadow()
      .find("#back-button")
      .click();

    cy.getIFrameBody().find("#select-id-type").should("be.visible");
  });
});

describe("KRA PIN verification enhanced kyc", () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: "POST",
        url: "*v1/async_id_verification*",
      },
      {
        statusCode: 200,
        body: { success: true },
      },
    ).as("submitIdVerification");

    cy.visit("/kra-verification-ekyc");

    cy.selectKRAType();
    cy.getIFrameBody().find("end-user-consent").shadow().find("#allow").click();
    cy.getIFrameBody().find("#id-info").should("be.visible");
  });

  it("should show an error message when input is invalid", () => {
    cy.getIFrameBody().get("#id_number-hint").should("not.exist");

    cy.getIFrameBody().find("#submitForm").click();

    cy.getIFrameBody().find("#id_number-hint").should("be.visible");

    cy.getIFrameBody()
      .find("#id_number-hint")
      .should("contain", "Id number is required");
    cy.getIFrameBody().find("#citizenship-hint").should("be.visible");

    cy.getIFrameBody()
      .find("#citizenship-hint")
      .should("contain", "Citizenship is required");

    cy.getIFrameBody().find("#id_number").type("1234567890");

    cy.getIFrameBody().find("#submitForm").click();

    cy.getIFrameBody()
      .find("#id_number-hint")
      .should("contain", "Id number is invalid");
  });

  it("should progress when input is valid", () => {
    cy.getIFrameBody().find("#id_number").type("1234");

    cy.getIFrameBody().find("#citizenship").select("Kenyan");

    cy.getIFrameBody().find("#submitForm").click();
    cy.wait("@submitIdVerification");
  });

  it("should show consent screen for the required id type", () => {
    cy.visit("/kra-verification-ekyc");

    cy.selectKRAType();

    cy.getIFrameBody()
      .find("end-user-consent")
      .shadow()
      .find("#consent-screen")
      .should("be.visible");
  });

  it("should show the select id page", () => {
    cy.getIFrameBody().find("#back-button").click();
    cy.getIFrameBody()
      .find("end-user-consent")
      .shadow()
      .find("#back-button")
      .click();

    cy.getIFrameBody().find("#select-id-type").should("be.visible");
  });
});
