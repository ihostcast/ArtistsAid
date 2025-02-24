const Joi = require('joi');

const organizationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Organization name must be at least 3 characters long',
      'string.max': 'Organization name cannot exceed 100 characters',
      'any.required': 'Organization name is required'
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),

  leaderEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Leader email is required'
    }),

  bankInfo: Joi.object({
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    routingNumber: Joi.string(),
    currency: Joi.string().default('USD')
  }).required(),

  customSettings: Joi.object({
    theme: Joi.object({
      primaryColor: Joi.string().default('#1a73e8'),
      secondaryColor: Joi.string().default('#4285f4'),
      logo: Joi.string().allow(null)
    }),
    features: Joi.object({
      allowPublicCauses: Joi.boolean().default(true),
      requireEvidenceUpload: Joi.boolean().default(true),
      automaticDisbursement: Joi.boolean().default(false)
    })
  }).default()
});

const subscriptionSchema = Joi.object({
  subscriptionTier: Joi.string()
    .valid('basic', 'pro', 'enterprise')
    .required(),
  
  subscriptionStatus: Joi.string()
    .valid('active', 'trial', 'expired')
    .required()
});

module.exports = {
  validateOrganizationData: (data) => organizationSchema.validate(data, { abortEarly: false }),
  validateSubscriptionUpdate: (data) => subscriptionSchema.validate(data, { abortEarly: false })
};
