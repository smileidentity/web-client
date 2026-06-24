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

  it('exposes the consent body as plain-text fragments (no HTML)', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('en');
      const { t } = win.localisation;
      const prefix = t('selfie.ess.consent.bodyPrefix');
      const middle = t('selfie.ess.consent.bodyMiddle');
      const suffix = t('selfie.ess.consent.bodySuffix');
      [prefix, middle, suffix].forEach((fragment) => {
        expect(fragment).to.be.a('string').and.not.equal('');
        // Body fragments must not carry markup — the component renders
        // <strong>Smile ID</strong> / <strong>{partnerName}</strong> via JSX.
        expect(fragment).to.not.match(/<\/?[a-z][\s\S]*>/i);
        expect(fragment).to.not.include('{{');
      });
      expect(prefix + middle + suffix).to.include('processing');
    });
  });

  it('does not interpolate the partner name into body fragments', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('en');
      const { t } = win.localisation;
      // The partner name is now rendered via JSX (<strong>{partner}</strong>),
      // never substituted into a translation string, so an attacker-controlled
      // partner name cannot smuggle markup into the consent copy.
      [
        'selfie.ess.consent.bodyPrefix',
        'selfie.ess.consent.bodyMiddle',
        'selfie.ess.consent.bodySuffix',
        'selfie.ess.consent.learnMoreBodyPrefix',
        'selfie.ess.consent.learnMoreBodyAnd',
        'selfie.ess.consent.learnMoreBodySuffix',
      ].forEach((key) => {
        expect(t(key)).to.not.include('partnerName');
      });
    });
  });

  it('keeps learn-more fragments as plain text in fr-FR', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('fr');
      const { t } = win.localisation;
      const fragments = [
        t('selfie.ess.consent.learnMoreBodyPrefix'),
        t('selfie.ess.consent.learnMoreBodyAnd'),
        t('selfie.ess.consent.learnMoreBodySuffix'),
      ];
      fragments.forEach((fragment) => {
        expect(fragment).to.be.a('string');
        expect(fragment).to.not.match(/<\/?[a-z][\s\S]*>/i);
      });
      expect(fragments.join('').toLowerCase()).to.match(/donn[ée]es/);
    });
  });

  it('switches to RTL when ar-EG becomes active', () => {
    cy.window().then(async (win) => {
      await win.localisation.setCurrentLocale('ar');
      expect(win.localisation.getDirection()).to.equal('rtl');
      const { t } = win.localisation;
      [
        'selfie.ess.consent.learnMoreBodyPrefix',
        'selfie.ess.consent.learnMoreBodyAnd',
        'selfie.ess.consent.learnMoreBodySuffix',
      ].forEach((key) => {
        expect(t(key))
          .to.be.a('string')
          .and.not.match(/<\/?[a-z][\s\S]*>/i);
      });
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
