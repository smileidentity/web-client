it("should grant consent, and navigate to image capture screen", () => {
  cy.loadIDOptions();

  cy.visit("/");
  cy.selectNINIDType();

  cy.getIFrameBody()
    .find("end-user-consent")
    .shadow()
    .find("#consent-screen")
    .should("be.visible");

  cy.getIFrameBody().find("end-user-consent").shadow().find("#allow").click();

  cy.getIFrameBody()
    .find("end-user-consent")
    .shadow()
    .find("#consent-screen")
    .should("not.be.visible");

  cy.getIFrameBody()
    .find("smart-camera-web")
    .shadow()
    .find("#request-screen")
    .should("be.visible");
});
