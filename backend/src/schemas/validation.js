const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('artist', 'verifier', 'financial', 'admin'),
  artistType: Joi.string().when('role', {
    is: 'artist',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  phoneNumber: Joi.string(),
  address: Joi.object()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const causeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid('medical', 'funeral', 'food', 'housing', 'other').required(),
  amountRequested: Joi.number().positive().required(),
  evidence: Joi.object().required(),
  location: Joi.object()
});

const donationSchema = Joi.object({
  causeId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().required(),
  isAnonymous: Joi.boolean(),
  message: Joi.string()
});

const receiptSchema = Joi.object({
  causeId: Joi.string().uuid().required(),
  fileUrl: Joi.string().uri().required(),
  description: Joi.string(),
  amount: Joi.number().positive().required(),
  date: Joi.date().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  causeSchema,
  donationSchema,
  receiptSchema
};
