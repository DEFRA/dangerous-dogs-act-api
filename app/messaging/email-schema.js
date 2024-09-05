const Joi = require('joi')

module.exports = Joi.object({
  toAddress: Joi.string().required(),
  templateId: Joi.string().required(),
  customFields: Joi.array().items({
    name: Joi.string().required(),
    value: Joi.string()
  }).optional()
}).required()
