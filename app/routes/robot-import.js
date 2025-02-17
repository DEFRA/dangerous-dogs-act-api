const Joi = require('joi')
const { downloadBlob } = require('../storage')
const { stages } = require('../constants/import')
const { importRegister, processRegister } = require('../import/robot')
const { getCallingUser } = require('../auth/get-user')
const { robotImportResponseSchema } = require('../schema/robot-import')
const { scopes } = require('../constants/auth')

module.exports = [{
  method: 'POST',
  path: '/robot-import',
  options: {
    tags: ['api'],
    auth: { scope: [scopes.admin] },
    notes: ['Performs the import of data from the robot'],
    response: {
      schema: robotImportResponseSchema
    },
    validate: {
      headers: Joi.object({
        'content-type': Joi.string().valid('application/json').required()
      }).unknown(),
      payload: Joi.object({
        filename: Joi.string().required(),
        stage: Joi.string().required()
      }),
      failAction: (request, h, error) => {
        console.error(error)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const blob = await downloadBlob(request.payload.filename)
      const stage = request.payload.stage
      const register = await importRegister(blob)

      console.log('Import validation completed. Error count = ', register.errors?.length ?? 0)

      if (register.errors?.length > 0 || stage === stages.spreadsheetValidation) {
        return h.response({ errors: register.errors, rows: register.add, log: register.log }).code(200)
      }

      console.log('Import insert starting')

      await processRegister(register, stage === stages.importValidation, getCallingUser(request))

      console.log('Import finished')

      return h.response({ errors: register.errors, log: register.log, rows: register.add }).code(200)
    }
  }
}]
