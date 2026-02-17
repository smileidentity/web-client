/**
 * Checks if the config has the new `id_info` parameter (not to be confused
 * with the internal `id_info` state object used throughout the product files).
 * @param {Object} config
 * @returns {boolean}
 */
export function hasIdInfo(config) {
  return (
    config.id_info != null &&
    typeof config.id_info === 'object' &&
    Object.keys(config.id_info).length > 0
  );
}

/**
 * Extracts field data for a selected country + ID type from the id_info param.
 * @param {Object} idInfo - the config.id_info object
 * @param {string} country - country code e.g. 'NG'
 * @param {string} idType - ID type e.g. 'BVN'
 * @returns {Object|null} field data or null
 */
export function extractIdInfoData(idInfo, country, idType) {
  if (!idInfo || !idInfo[country] || !idInfo[country][idType]) {
    return null;
  }
  const data = idInfo[country][idType];
  if (typeof data !== 'object' || Object.keys(data).length === 0) {
    return null;
  }
  return data;
}

/**
 * Parses a DOB string 'YYYY-MM-DD' into { day, month, year }.
 * @param {string} dobString
 * @returns {{ day: string, month: string, year: string } | null}
 */
export function parseDOB(dobString) {
  if (!dobString || typeof dobString !== 'string') return null;
  const parts = dobString.split('-');
  if (parts.length !== 3) return null;
  return {
    year: parts[0],
    month: parts[1],
    day: parts[2],
  };
}

/**
 * Validates pre-filled fields against required fields and regex patterns.
 * @param {Object} fields - pre-filled field data from id_info
 * @param {string[]} requiredFields - from product constraints
 * @param {Object} idTypeConstraints - the id type constraints object (has id_number_regex)
 * @returns {{ allValid: boolean, validFields: Object, invalidFields: Object, missingFields: string[] }}
 */
export function validatePrefilledFields(
  fields,
  requiredFields,
  idTypeConstraints,
) {
  const validFields = {};
  const invalidFields = {};
  const missingFields = [];

  // Map DOB if provided as single string
  let expandedFields = { ...fields };
  if (fields.dob && typeof fields.dob === 'string') {
    const parsed = parseDOB(fields.dob);
    if (parsed) {
      expandedFields = { ...expandedFields, ...parsed };
    }
  }

  const fieldChecks = {
    id_number: (value) => {
      if (!value) return false;
      if (idTypeConstraints.id_number_regex) {
        return new RegExp(idTypeConstraints.id_number_regex).test(value);
      }
      return true;
    },
    first_name: (value) => !!value && value.trim().length > 0,
    last_name: (value) => !!value && value.trim().length > 0,
    day: (value) => !!value && value.toString().trim().length > 0,
    month: (value) => !!value && value.toString().trim().length > 0,
    year: (value) => !!value && value.toString().trim().length > 0,
  };

  const nonUserFields = [
    'country',
    'id_type',
    'session_id',
    'user_id',
    'job_id',
  ];

  requiredFields
    .filter((reqField) => !nonUserFields.includes(reqField))
    .forEach((reqField) => {
      if (reqField === 'dob') {
        ['day', 'month', 'year'].forEach((dobPart) => {
          const val = expandedFields[dobPart];
          if (val == null || val.toString().trim() === '') {
            missingFields.push(dobPart);
          } else {
            validFields[dobPart] = val;
          }
        });
        return;
      }

      const value = expandedFields[reqField];
      const checker = fieldChecks[reqField];

      if (value == null || value.toString().trim() === '') {
        missingFields.push(reqField);
      } else if (checker && !checker(value)) {
        invalidFields[reqField] = value;
      } else {
        validFields[reqField] = value;
      }
    });

  return {
    allValid:
      missingFields.length === 0 && Object.keys(invalidFields).length === 0,
    validFields,
    invalidFields,
    missingFields,
  };
}

/**
 * Determines whether the selection screen should be shown when using id_info.
 * @param {Object} idInfo - the config.id_info object
 * @returns {{ shouldSkip: boolean, country: string|null, idType: string|null }}
 */
export function shouldSkipSelection(idInfo) {
  const countries = Object.keys(idInfo);
  if (countries.length !== 1) {
    return { shouldSkip: false, country: null, idType: null };
  }
  const country = countries[0];
  const idTypes = Object.keys(idInfo[country]);
  if (idTypes.length !== 1) {
    return { shouldSkip: false, country, idType: null };
  }
  return { shouldSkip: true, country, idType: idTypes[0] };
}

/**
 * Converts id_info format to id_selection format for use with existing selection screen logic.
 * @param {Object} idInfo - the config.id_info object
 * @returns {Object} id_selection compatible object e.g. { NG: ['BVN', 'NIN'] }
 */
export function idInfoToIdSelection(idInfo) {
  const result = {};
  Object.keys(idInfo).forEach((country) => {
    result[country] = Object.keys(idInfo[country]);
  });
  return result;
}
