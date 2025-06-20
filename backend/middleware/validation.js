const Joi = require('joi');

const createIssueSchema = Joi.object({
  userName: Joi.string().trim().min(1).max(100).required(),
  issueDate: Joi.string().isoDate().required(),
  issueDescription: Joi.string().trim().min(10).max(5000).required(),
  precedingEvents: Joi.string().trim().max(5000).allow('').optional(),
  resolutionSteps: Joi.string().trim().max(5000).allow('').optional()
});

const updateIssueSchema = Joi.object({
  userName: Joi.string().trim().min(1).max(100).optional(),
  issueDate: Joi.string().isoDate().optional(),
  issueDescription: Joi.string().trim().min(10).max(5000).optional(),
  precedingEvents: Joi.string().trim().max(5000).allow('').optional(),
  resolutionSteps: Joi.string().trim().max(5000).allow('').optional(),
  technicianName: Joi.string().trim().min(1).max(100).allow('').optional(),
  technicianNotes: Joi.string().trim().max(5000).allow('').optional(),
  isResolved: Joi.boolean().optional()
});

const techUpdateSchema = Joi.object({
  technicianName: Joi.string().trim().min(1).max(100).required(),
  technicianNotes: Joi.string().trim().max(5000).required(),
  isResolved: Joi.boolean().required()
});

const validateCreateIssue = (req, res, next) => {
  const { error } = createIssueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateUpdateIssue = (req, res, next) => {
  const { error } = updateIssueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateTechUpdate = (req, res, next) => {
  const { error } = techUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateCreateIssue,
  validateUpdateIssue,
  validateTechUpdate
};