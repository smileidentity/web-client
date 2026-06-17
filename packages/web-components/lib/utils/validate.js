// Minimal drop-in replacement for the (archived) validate.js package.
// We only ever used the `presence` and `format` validators, so this
// implements exactly those with the same `{ field: [message] }` output
// shape, including validate.js's `^` message convention and field-name
// humanizing. Dropping the dependency clears advisory GHSA-rv73-9c8w-jp4c
// (a ReDoS in validate.js's built-in email/url/date regexes, which we
// never invoked).
// Scope is intentionally limited to `presence` and `format` — the only
// validators this codebase uses.

function isEmpty(value) {
  return value == null || (typeof value === 'string' && /^\s*$/.test(value));
}

function prettify(attr) {
  return attr
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

function formatMessage(attr, message) {
  // A leading `^` means "use the message verbatim" (no field-name prefix).
  if (message && message[0] === '^') return message.slice(1);
  return `${prettify(attr)} ${message}`;
}

export default function validate(values, constraints) {
  const errors = {};

  Object.keys(constraints).forEach((attr) => {
    const value = values[attr];
    const rules = constraints[attr];
    const messages = [];

    // Run validators in the constraint's own key order — validate.js 0.13.1
    // preserves that order in its error array, and callers read errors[0].
    Object.keys(rules).forEach((rule) => {
      if (rule === 'presence') {
        // allowEmpty !== false ? fail only if null/undefined : fail if empty.
        const allowEmpty = rules.presence.allowEmpty !== false;
        if (allowEmpty ? value == null : isEmpty(value)) {
          messages.push(
            formatMessage(attr, rules.presence.message || "can't be blank"),
          );
        }
      } else if (rule === 'format' && value != null) {
        // validate.js 0.13.1 runs `format` on empty strings but skips
        // null/undefined (only `presence` catches those).
        const opts = rules.format;
        const pattern =
          opts instanceof RegExp || typeof opts === 'string'
            ? opts
            : opts.pattern;
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        const match = regex.exec(value);
        // validate.js requires the whole string to match.
        if (!match || match[0].length !== String(value).length) {
          messages.push(
            formatMessage(attr, (opts && opts.message) || 'is invalid'),
          );
        }
      }
    });

    if (messages.length) errors[attr] = messages;
  });

  return Object.keys(errors).length ? errors : undefined;
}
