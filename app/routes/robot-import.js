const Joi = require('joi')
const { importRegister } = require('../import/robot/importer')
const { downloadBlob } = require('../storage')
const { processRegister } = require('../import/robot/processor')

module.exports = [{
  method: 'POST',
  path: '/robot-import',
  options: {
    validate: {
      payload: Joi.object({
        filename: Joi.string().required()
      }),
      failAction: (request, h, error) => {
        console.error(error)
        return h.response(error).code(400)
      },
    },
    handler: async (request, h) => {
      const blob = await downloadBlob('inbound', request.payload.filename)
      const register = await importRegister(blob)

      await processRegister(register)
  
      return h.response(register).code(200)
    }
  },
}]
