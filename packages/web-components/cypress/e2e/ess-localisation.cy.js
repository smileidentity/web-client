/**
 * Verifies the `selfie.ess.*` translation namespace introduced for the
 * Enhanced SmartSelfie flow resolves correctly across the three bundled
 * locales (en-GB, fr-FR, ar-EG) and that company names ("Smile ID",
 * partner name) are preserved verbatim through `tHtml` interpolation.
 */

const SAMPLE_KEYS = [
  'selfie.ess.back',
  'selfie.ess.consent.titleSuffix',
  'selfie.ess.consent.items.contact',
  'selfie.ess.consent.consentCheckbox',
  'selfie.ess.consent.learnMore',
  'selfie.ess.consent.allow',
  'selfie.ess.consent.deny',
  'selfie.ess.instructions.titlePrefix',
  'selfie.ess.instructions.titleAccent',
  'selfie.ess.instructions.guidelinesHeader',
  'selfie.ess.instructions.tile.good',
  'selfie.ess.instructions.tile.accessories',
  'selfie.ess.instructions.tile.multipleFaces',
  'selfie.ess.instructions.tile.poorLighting',
  'selfie.ess.instructions.continue',
  'selfie.ess.instructions.settingUpCamera',
  'selfie.ess.submission.review.title',
  'selfie.ess.submission.review.body',
  'selfie.ess.submission.review.retake',
  'selfie.ess.submission.review.confirm',
  'selfie.ess.submission.submitting.title',
  'selfie.ess.submission.submitting.body',
  'selfie.ess.submission.success.title',
  'selfie.ess.submission.success.body',
  'selfie.ess.submission.error.title',
  'selfie.ess.submission.continue',
  'selfie.ess.submission.exit',
  'selfie.ess.submission.imageAlt',
  'selfie.ess.alert.centerFace',
  'selfie.ess.alert.holdStill',
  'selfie.ess.alert.tooDark',
  'selfie.ess.alert.tooClose',
  'selfie.ess.alert.tooFar',
  'selfie.ess.alert.moveDeviceUp',
  'selfie.ess.alert.moveDeviceDown',
  'selfie.ess.alert.moveDeviceLeft',
  'selfie.ess.alert.moveDeviceRight',
  'selfie.ess.alert.turnHeadLeft',
  'selfie.ess.alert.turnHeadRight',
  'selfie.ess.alert.tiltHeadUp',
  'selfie.ess.failure.sessionTimedOut',
];

const expectAllResolve = (win) => {
  const { t } = win.localisation;
  SAMPLE_KEYS.forEach((key) => {
    const value = t(key);
    expect(value, `t('${key}')`).to.be.a('string').and.not.equal(key);
    expect(value).to.not.match(/missing translation/i);
  });
};

describe('ESS localisation (selfie.ess.*)', () => {
  beforeEach(() => {
    cy.visit('/cypress/pages/localisation-test.html');
    cy.window().should('have.property', 'localisationLoaded', true);
  });

  ['en', 'fr', 'ar'].forEach((lang) => {
    it(`resolves every ESS key for "${lang}"`, () => {
      cy.window().then(async (win) => {
        await win.localisation.setCurrentLocale(lang);
        expectAllResolve(win);
      });
    });
  });

  it('interpolates the partner name through tHtml without escaping <strong>', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('en');
      const html = win.localisation.tHtml('selfie.ess.consent.body', {
        partnerName: 'Acme Bank',
      });
      expect(html).to.include('<strong>Smile ID</strong>');
      expect(html).to.include('<strong>Acme Bank</strong>');
      expect(html).to.not.include('&lt;strong&gt;');
    });
  });

  it('escapes unsafe partner names inside tHtml', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('en');
      const html = win.localisation.tHtml('selfie.ess.consent.body', {
        partnerName: '<script>alert(1)</script>',
      });
      // Static <strong> markup from the locale file is preserved …
      expect(html).to.include('<strong>Smile ID</strong>');
      // … but the injected param is HTML-escaped.
      expect(html).to.not.include('<script>alert(1)</script>');
      expect(html).to.include('&lt;script&gt;');
    });
  });

  it('keeps "Smile ID" and the partner name untranslated in fr-FR', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('fr');
      const html = win.localisation.tHtml('selfie.ess.consent.learnMoreBody', {
        partnerName: 'Acme Bank',
      });
      expect(html).to.include('<strong>Smile ID</strong>');
      expect(html).to.include('<strong>Acme Bank</strong>');
      // Sanity-check that this is actually the French copy.
      expect(html.toLowerCase()).to.match(/donn[ée]es/);
    });
  });

  it('switches to RTL when ar-EG becomes active', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('ar');
      expect(win.localisation.getDirection()).to.equal('rtl');
      const html = win.localisation.tHtml('selfie.ess.consent.learnMoreBody', {
        partnerName: 'Acme Bank',
      });
      expect(html).to.include('<strong>Smile ID</strong>');
      expect(html).to.include('<strong>Acme Bank</strong>');
    });
  });

  it('falls back to en-GB when a key is missing in the active locale', () => {
    cy.window().then(async (win) => {
      const { setCurrentLocale, registerLocale, t } = win.localisation;
      registerLocale('xx-ZZ', { direction: 'ltr' });
      await setCurrentLocale('xx-ZZ');
      expect(t('selfie.ess.consent.allow')).to.equal('Allow');
    });
  });
});
