const Joi = require('joi')
const { getCdo } = require('../../repos/cdo')

const exemption = Joi.object({
  indexNumber: Joi.string().required(),
  cdoIssued: Joi.date().iso().required(),
  cdoExpiry: Joi.date().iso().required(),
  court: Joi.string().required(),
  policeForce: Joi.string().required(),
  legislationOfficer: Joi.string().allow(null).allow('').optional(),
  certificateIssued: Joi.date().iso().allow(null).optional(),
  applicationFeePaid: Joi.date().iso().allow(null).optional(),
  neuteringConfirmation: Joi.date().iso().allow(null).optional(),
  microchipVerification: Joi.date().iso().allow(null).optional(),
  joinedExemptionScheme: Joi.date().iso().allow(null).optional(),
  insurance: Joi.object({
    company: Joi.string().optional(),
    renewalDate: Joi.date().iso().required()
  }).optional()
})

const orderSpecific = Joi.object({
  exemptionOrder: Joi.string().optional(),
  microchipDeadline: Joi.date().iso().optional(),
  typedByDlo: Joi.date().iso().optional(),
  withdrawn: Joi.date().iso().optional()
})

const validatePayload = async (payload) => {
  let schema = exemption

  const cdo = await getCdo(payload.indexNumber)

  const order = cdo?.registration.exemption_order.exemption_order

  if (order === '2023') {
    schema = schema.concat(orderSpecific)
  }

  const { value, error } = schema.validate(payload)

  if (error) {
    throw error
  }

  return value
}

module.exports = {
  validatePayload
}
