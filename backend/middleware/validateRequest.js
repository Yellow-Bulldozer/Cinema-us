const validateRequest = (...requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        return res.status(400).json({
          success: false,
          message: `Field '${field}' is required`,
        });
      }
    }
    next();
  };
};

export default validateRequest;
