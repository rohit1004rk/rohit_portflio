import validator from 'validator';

/**
 * Small, dependency-light request validator.
 *
 * Rules are declared per field: { required, type, min, max }.
 * Every string value is trimmed and HTML-escaped before it reaches a
 * controller, so stored data can never carry markup/script payloads.
 */
const validateField = (name, value, rule) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return rule.required ? `${rule.label || name} is required` : null;
  }
  const str = String(value).trim();
  if (rule.type === 'email' && !validator.isEmail(str)) {
    return 'Please provide a valid email address';
  }
  if (rule.min && str.length < rule.min) {
    return `${rule.label || name} must be at least ${rule.min} characters`;
  }
  if (rule.max && str.length > rule.max) {
    return `${rule.label || name} must be under ${rule.max} characters`;
  }
  return null;
};

export const validateBody = (rules) => (req, res, next) => {
  const errors = {};
  const clean = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const error = validateField(field, req.body[field], rule);
    if (error) {
      errors[field] = error;
      return;
    }
    const raw = req.body[field];
    if (raw === undefined || raw === null) return;
    clean[field] =
      typeof raw === 'string'
        ? validator.escape(raw.trim())
        : raw;
  });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: Object.values(errors)[0],
      errors,
    });
  }

  // Replace only the validated fields; anything else is dropped so clients
  // cannot inject unexpected keys (e.g. `role`) into a create call.
  req.body = { ...clean };
  next();
};

export default validateBody;
