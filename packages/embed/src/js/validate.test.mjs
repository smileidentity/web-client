// Self-contained check for the validate.js drop-in replacement.
// Expected outputs were captured from the real validate.js 0.13.1 before
// it was removed, so this locks in byte-for-byte behaviour parity.
// Run: node --test packages/embed/src/js/validate.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import validate from './validate.js';

const idC = (msgP, msgF) => ({
  id_number: {
    presence: { allowEmpty: false, message: msgP },
    format: { pattern: new RegExp('[0-9]{11}'), message: msgF },
  },
});
// TotpConsent orders the keys format-then-presence and uses a bare RegExp
// with no format message — both affect the first error string callers read.
const totpC = {
  id_number: {
    format: new RegExp('\\d{5}'),
    presence: { allowEmpty: false, message: 'is required' },
  },
};

const cases = [
  [
    'empty string runs both validators, presence first',
    { id_number: '' },
    idC('^ID required', '^Bad ID'),
    { id_number: ['ID required', 'Bad ID'] },
  ],
  [
    'valid passes',
    { id_number: '12345678901' },
    idC('^ID required', '^Bad ID'),
    undefined,
  ],
  [
    'too short fails format only',
    { id_number: '12' },
    idC('^ID required', '^Bad ID'),
    { id_number: ['Bad ID'] },
  ],
  [
    'trailing chars fail (full-string match required)',
    { id_number: '12345678901extra' },
    {
      id_number: {
        presence: { allowEmpty: false },
        format: { pattern: new RegExp('[0-9]{11}'), message: '^Bad ID' },
      },
    },
    { id_number: ['Bad ID'] },
  ],
  [
    'missing field: presence only, format skips null/undefined',
    {},
    idC('^ID required', '^Bad ID'),
    { id_number: ['ID required'] },
  ],
  [
    'TOTP whitespace: format-first ordering + humanized messages',
    { id_number: '  ' },
    totpC,
    { id_number: ['Id number is invalid', 'Id number is required'] },
  ],
  [
    'TOTP bad value',
    { id_number: 'abc' },
    totpC,
    { id_number: ['Id number is invalid'] },
  ],
  ['TOTP valid', { id_number: '12345' }, totpC, undefined],
];

for (const [name, values, constraints, expected] of cases) {
  test(name, () => {
    assert.deepStrictEqual(validate(values, constraints), expected);
  });
}
