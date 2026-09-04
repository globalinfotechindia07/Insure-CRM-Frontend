import { toast } from 'react-toastify';

/**
 * Array of all policy amount fields across Add, Edit, and Renew Policy screens.
 */
export const POLICY_AMOUNT_FIELDS = [
  'sumInsured',
  'netPremium',
  'tpPremium',
  'odPremium',
  'tpGstAmount',
  'tpAmount',
  'odGstAmount',
  'odAmount',
  'gstAmount',
  'totalAmount',
  'paidAmount',
  'permiumOtherThanTerrorism',
  'terrorism',
  'endorsementTerrorism',
  'endorsementOtherTerrorism',
  'endorsementNetPremium',
  'endorsementGstAmount',
  'etotalAmount',
  'amountOnOtherTerr',
  'amountOnTerr',
  'tpBrokerageAmount',
  'odBrokerageAmount',
  'totalBrokerageAmount',
  'totalBrokerageGst',
  'totalBrokerageAmountincGst',
  'coBrokerageAmount'
];

/**
 * Formats a numeric string or number into comma-separated amount (Indian numbering format).
 * e.g., '10000' -> '10,000', '1000000' -> '10,00,000', '1250.50' -> '1,250.50'
 */
export const formatAmountWithCommas = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val).replace(/,/g, '').trim();
  if (str === '' || str === '-') return str;

  const num = Number(str);
  if (isNaN(num)) return val;

  const roundedStr = String(Math.round(num));
  const isNegative = roundedStr.startsWith('-');
  const absInt = isNegative ? roundedStr.slice(1) : roundedStr;

  if (absInt.length <= 3) {
    return (isNegative ? '-' : '') + absInt;
  }

  const lastThree = absInt.substring(absInt.length - 3);
  const otherNumbers = absInt.substring(0, absInt.length - 3);
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;

  return (isNegative ? '-' : '') + formattedInt;
};

/**
 * Parses numeric value from a string (stripping any commas).
 * e.g., '10,000.50' -> 10000.50
 */
export const parseAmount = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Unformats comma string to plain string.
 */
export const unformatAmount = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/,/g, '').trim();
};

/**
 * Converts camelCase, snake_case, or kebab-case field names to human-readable labels.
 * e.g., 'companyName' -> 'Company Name', 'phone_no' -> 'Phone No'
 */
export const formatFieldLabel = (fieldName) => {
  if (!fieldName) return '';
  const result = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 */
export const isEmptyValue = (val) => {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
};

/**
 * Basic format checkers
 */
export const isValidEmail = (email) => {
  if (!email) return true;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return true;
  const re = /^[0-9+\s\-()]{7,15}$/;
  return re.test(String(phone).trim());
};

/**
 * Transforms raw technical error messages (e.g. Mongoose CastError, database duplicate keys)
 * into clean, user-friendly natural language text.
 */
export const formatApiErrorMessage = (rawError, defaultMsg = 'Unable to save details. Please check your form entries and try again.') => {
  if (!rawError) return defaultMsg;
  const str = typeof rawError === 'string' ? rawError : rawError.message || rawError.error || defaultMsg;

  if (typeof str !== 'string') return defaultMsg;

  // Handle Mongoose cast errors (e.g. Cast to Number failed for value "10,000" at path "sumInsured")
  if (str.includes('Cast to') && str.includes('at path')) {
    const matchPath = str.match(/at path "([^"]+)"/);
    const fieldName = matchPath ? formatFieldLabel(matchPath[1]) : 'one of the form fields';
    
    if (str.includes('Cast to ObjectId')) {
      return `Invalid selection or reference for "${fieldName}". Please ensure you have selected a valid option.`;
    } else if (str.includes('Cast to Number')) {
      return `Invalid number format for "${fieldName}". Please enter a valid number.`;
    } else if (str.includes('Cast to date')) {
      return `Invalid date format for "${fieldName}". Please enter a valid date.`;
    }
    
    return `Invalid value provided for "${fieldName}". Please check your input.`;
  }

  // Handle Duplicate key error
  if (str.includes('E11000') || str.includes('duplicate key')) {
    return 'A record with this information already exists in the system.';
  }

  // Handle Validation errors
  if (str.includes('validation failed')) {
    return 'Validation failed. Please review the highlighted fields on the form.';
  }

  // Handle Generic Server Errors
  if (str.toLowerCase().includes('server error') || str.toLowerCase().includes('internal server')) {
    return 'A temporary server error occurred. Please verify your entries and try again.';
  }

  return str;
};

/**
 * Global form validation function.
 */
export const validateFormFields = (formData = {}, rules = [], setErrors = null, options = {}) => {
  const { showToast = true, toastPrefix = 'Please fill in the required fields:', customLabels = {} } = options;
  const errors = {};
  const missingFieldLabels = [];
  const invalidFieldLabels = [];

  const fieldConfig = {};

  if (Array.isArray(rules)) {
    rules.forEach((item) => {
      if (typeof item === 'string') {
        const label = customLabels[item] || formatFieldLabel(item);
        fieldConfig[item] = { label, required: true };
      } else if (typeof item === 'object' && item !== null && item.field) {
        const label = item.label || customLabels[item.field] || formatFieldLabel(item.field);
        fieldConfig[item.field] = {
          label,
          required: item.required !== false,
          type: item.type
        };
      }
    });
  } else if (typeof rules === 'object' && rules !== null) {
    Object.keys(rules).forEach((key) => {
      const val = rules[key];
      if (typeof val === 'boolean') {
        const label = customLabels[key] || formatFieldLabel(key);
        fieldConfig[key] = { label, required: val };
      } else if (typeof val === 'string') {
        fieldConfig[key] = { label: val, required: true };
      } else if (typeof val === 'object' && val !== null) {
        const label = val.label || customLabels[key] || formatFieldLabel(key);
        fieldConfig[key] = {
          label,
          required: val.required !== false,
          type: val.type
        };
      }
    });
  }

  // Evaluate each rule against formData
  Object.keys(fieldConfig).forEach((fieldKey) => {
    const config = fieldConfig[fieldKey];
    const val = formData ? formData[fieldKey] : undefined;

    if (config.required && isEmptyValue(val)) {
      const msg = `${config.label} is required`;
      errors[fieldKey] = msg;
      missingFieldLabels.push(config.label);
    } else if (!isEmptyValue(val)) {
      if (config.type === 'email' && !isValidEmail(val)) {
        const msg = `Please enter a valid email address`;
        errors[fieldKey] = msg;
        invalidFieldLabels.push(config.label);
      } else if (config.type === 'phone' && !isValidPhone(val)) {
        const msg = `Please enter a valid contact number`;
        errors[fieldKey] = msg;
        invalidFieldLabels.push(config.label);
      }
    }
  });

  const isValid = Object.keys(errors).length === 0;

  if (setErrors && typeof setErrors === 'function') {
    setErrors(errors);
  }

  if (!isValid && showToast) {
    const messages = [];
    if (missingFieldLabels.length > 0) {
      messages.push(`${missingFieldLabels.join(', ')}`);
    }
    if (invalidFieldLabels.length > 0) {
      messages.push(`Invalid format: ${invalidFieldLabels.join(', ')}`);
    }
    toast.error(`${toastPrefix} ${messages.join('. ')}`);
  }

  return { isValid, errors, missingFields: missingFieldLabels, invalidFields: invalidFieldLabels };
};

export const notifyRequiredFields = (missingFields = [], prefix = 'Please fill in the required fields:') => {
  if (!missingFields || missingFields.length === 0) {
    toast.error('Please fill in all required fields before submitting.');
    return;
  }
  const fieldsStr = missingFields
    .map((f) => (typeof f === 'string' ? formatFieldLabel(f) : f))
    .join(', ');
  toast.error(`${prefix} ${fieldsStr}`);
};

export const validateRequiredFields = (formData, requiredFields = [], setErrors = null, options = {}) => {
  return validateFormFields(formData, requiredFields, setErrors, options);
};

export default validateFormFields;
