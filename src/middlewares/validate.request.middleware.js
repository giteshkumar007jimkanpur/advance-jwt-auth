const validateRequest = (schema) => (req, res, next) => {
  // Ensure req.body is always an object
  if (!req.body || typeof req.body !== 'object') {
    return res
      .status(400)
      .json({ message: 'Request body must be a valid JSON object' });
  }

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((err) => err.message),
    });
  }

  next();
};

module.exports = validateRequest;
