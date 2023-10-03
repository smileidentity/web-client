it("should load an iframe", () => {
  cy.visit("/");

  cy.getIFrameBody().should("be.visible");
});
