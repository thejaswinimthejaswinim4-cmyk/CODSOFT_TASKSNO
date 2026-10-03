/**
 * Joi validation middleware generator
 * @param {import('joi').Schema} schema - Joi schema object
 * @param {'body' | 'query' | 'params'} [property='body'] - Request property to validate
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unallowed fields
      convert: true, // Typecast when appropriate (e.g. string to number in query/params)
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    // Overwrite with cleaned and sanitized value
    req[property] = value;
    next();
  };
};

module.exports = validate;
