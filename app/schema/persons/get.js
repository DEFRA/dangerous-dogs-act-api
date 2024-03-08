const Joi = require('joi')

const personsFilter = Joi.object({
  firstName: Joi.string().optional().allow('').allow(null),
  lastName: Joi.string().optional().allow('').allow(null),
  dateOfBirth: Joi.date().iso().allow(null).optional()
})

const personsResponse = Joi.object({
  persons: Joi.array().items(Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birthDate: Joi.string().allow(null),
    personReference: Joi.string().required(),
    address: Joi.object({
      addressLine1: Joi.string().required(),
      addressLine2: Joi.string().allow(null).allow('').optional(),
      town: Joi.string().required(),
      postcode: Joi.string().required(),
      county: Joi.string().allow('').allow(null).optional(),
      country: Joi.string().required()
    })
  }))
})

module.exports = {
  personsFilter,
  personsResponse
}
