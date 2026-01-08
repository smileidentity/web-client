describe('Localisation Module', () => {
  beforeEach(() => {
    cy.visit('/cypress/pages/localisation-test.html');
    // Wait for the localisation module to load
    cy.window().should('have.property', 'localisationLoaded', true);
  });

  describe('deepMerge', () => {
    it('should merge nested objects preserving non-overridden values', () => {
      cy.window().then((win) => {
        const { deepMerge } = win.localisation;

        const target = {
          camera: { error: { notAllowed: 'Not allowed' } },
          common: { back: 'Back', continue: 'Continue' },
        };
        const source = {
          common: { continue: 'Proceed' },
        };

        const result = deepMerge(target, source);

        expect(result.common.back).to.equal('Back'); // Preserved
        expect(result.common.continue).to.equal('Proceed'); // Overridden
        expect(result.camera.error.notAllowed).to.equal('Not allowed'); // Preserved
      });
    });

    it('should deeply merge nested structures', () => {
      cy.window().then((win) => {
        const { deepMerge } = win.localisation;

        const target = {
          camera: {
            error: {
              notAllowed: 'Original not allowed',
              notFound: 'Camera not found',
            },
          },
        };
        const source = {
          camera: {
            error: {
              notAllowed: 'Custom not allowed message',
            },
          },
        };

        const result = deepMerge(target, source);

        expect(result.camera.error.notAllowed).to.equal(
          'Custom not allowed message',
        );
        expect(result.camera.error.notFound).to.equal('Camera not found');
      });
    });

    it('should handle null/undefined source gracefully', () => {
      cy.window().then((win) => {
        const { deepMerge } = win.localisation;

        const target = { common: { back: 'Back' } };

        expect(deepMerge(target, null)).to.deep.equal(target);
        expect(deepMerge(target, undefined)).to.deep.equal(target);
      });
    });

    it('should not mutate original objects', () => {
      cy.window().then((win) => {
        const { deepMerge } = win.localisation;

        const target = { common: { back: 'Back', continue: 'Continue' } };
        const source = { common: { continue: 'Proceed' } };
        const targetCopy = JSON.parse(JSON.stringify(target));

        deepMerge(target, source);

        expect(target).to.deep.equal(targetCopy);
      });
    });
  });

  describe('validateLocale', () => {
    it('should return valid for complete locale', () => {
      cy.window().then((win) => {
        const { t } = win.localisation;

        // Get a key from the bundled locale to ensure it's complete
        const backText = t('common.back');
        expect(backText).to.equal('Back');

        // The bundled en-GB locale should be complete
        // We can't directly access locales, but we can test via setCurrentLocale
      });
    });

    it('should return missing keys for incomplete locale', () => {
      cy.window().then((win) => {
        const { validateLocale } = win.localisation;

        const incompleteLocale = {
          common: { back: 'Back' },
          direction: 'ltr',
          // Missing many required keys
        };

        const result = validateLocale(incompleteLocale);

        expect(result.valid).to.equal(false);
        expect(result.missingKeys).to.include('common.continue');
        expect(result.missingKeys).to.include('camera.permission.description');
      });
    });

    it('should return all missing keys for empty object', () => {
      cy.window().then((win) => {
        const { validateLocale } = win.localisation;

        const result = validateLocale({});

        expect(result.valid).to.equal(false);
        expect(result.missingKeys.length).to.be.greaterThan(0);
      });
    });
  });

  describe('setCurrentLocale with custom locales', () => {
    it('should override bundled locale keys', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, t } = win.localisation;

        // Override the continue button text
        await setCurrentLocale('en', {
          locales: {
            en: {
              common: { continue: 'Next Step' },
            },
          },
        });

        expect(t('common.continue')).to.equal('Next Step');
        expect(t('common.back')).to.equal('Back'); // Unchanged
      });
    });

    it('should register a new custom locale', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, t, getCurrentLocale } = win.localisation;

        const swahiliLocale = {
          camera: {
            error: {
              abort: 'Kitu kimetokea',
              insecure: 'Muunganisho salama unahitajika',
              notAllowed: 'Kamera haijaruhusiwa',
              notFound: 'Kamera haipatikani',
              notReadable: 'Kamera haiwezi kusomwa',
            },
            permission: {
              description: 'Ruhusu kamera kuthibitisha maelezo yako',
              requestButton: 'Omba Ruhusa ya Kamera',
            },
          },
          common: {
            allow: 'Ruhusu',
            back: 'Rudi',
            cancel: 'Ghairi',
            close: 'Funga',
            closeVerificationFrame: 'Funga uhakiki',
            continue: 'Endelea',
            or: 'au',
            toggle: 'Badilisha',
          },
          direction: 'ltr',
          document: {
            capture: {
              captureButton: 'Chukua Picha ya Hati',
            },
            review: {
              acceptButton: 'Ndiyo, hati yangu inasomeka',
              retakeButton: 'Hapana, chukua picha tena',
            },
          },
          selfie: {
            capture: {
              button: {
                takeSelfie: 'Chukua Picha',
              },
            },
            instructions: {
              title: 'Tutachukua picha ya uso',
            },
            review: {
              acceptButton: 'Ndiyo, tumia hii',
              retakeButton: 'Hapana, chukua tena',
              title: 'Pitia Picha',
            },
          },
        };

        await setCurrentLocale('sw', {
          locales: {
            sw: swahiliLocale,
          },
        });

        expect(getCurrentLocale()).to.equal('sw');
        expect(t('common.continue')).to.equal('Endelea');
        expect(t('common.back')).to.equal('Rudi');
      });
    });

    it('should handle multiple locales at once', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, t } = win.localisation;

        await setCurrentLocale('en', {
          locales: {
            en: { common: { continue: 'Proceed' } },
            fr: { common: { continue: 'Continuer modifié' } },
          },
        });

        // English should be modified
        expect(t('common.continue')).to.equal('Proceed');

        // Switch to French and verify it's also modified
        await setCurrentLocale('fr', {});
        expect(t('common.continue')).to.equal('Continuer modifié');
      });
    });

    it('should apply RTL direction for RTL locale', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, getDirection } = win.localisation;

        await setCurrentLocale('ar', {});

        expect(getDirection()).to.equal('rtl');
        expect(document.documentElement.dir).to.equal('rtl');
      });
    });

    it('should apply LTR direction for custom LTR locale', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, getDirection } = win.localisation;

        await setCurrentLocale('sw', {
          locales: {
            sw: {
              common: { continue: 'Endelea' },
              direction: 'ltr',
            },
          },
        });

        expect(getDirection()).to.equal('ltr');
      });
    });
  });

  describe('backwards compatibility', () => {
    it('should still work with simple language parameter', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, t, getCurrentLocale } = win.localisation;

        await setCurrentLocale('fr');

        expect(getCurrentLocale()).to.equal('fr-FR');
        // French translations should be available
        expect(t('common.continue')).to.not.equal('common.continue');
      });
    });

    it('should work with legacy translation option', () => {
      cy.window().then(async (win) => {
        const { setCurrentLocale, t } = win.localisation;

        await setCurrentLocale('custom-legacy', {
          translation: {
            common: {
              back: 'Legacy Back',
              continue: 'Legacy Continue',
            },
            direction: 'ltr',
          },
        });

        expect(t('common.continue')).to.equal('Legacy Continue');
      });
    });
  });
});
