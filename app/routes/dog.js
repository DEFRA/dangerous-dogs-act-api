const { getCallingUser } = require('../auth/get-user')
const { addImportedDog, updateDog, getDogByIndexNumber } = require('../repos/dogs')
const { dogDto } = require('../dto/dog')
const { personDto } = require('../dto/person')
const { getOwnerOfDog } = require('../repos/people')

module.exports = [{
  method: 'GET',
  path: '/dog/{indexNumber}',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber
    try {
      const dog = await getDogByIndexNumber(indexNumber)
      return h.response({ dog: dogDto(dog) }).code(200)
    } catch (e) {
      console.log(e)
      throw e
    }
  }
},
{
  method: 'GET',
  path: '/dog-owner/{indexNumber}',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    const indexNumber = request.params.indexNumber

    try {
      const owner = await getOwnerOfDog(indexNumber)
      return h.response({ owner: personDto(owner.person, true) }).code(200)
    } catch (e) {
      console.log(e)
      throw e
    }
  }
},
{
  method: 'POST',
  path: '/dog',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    if (!request.payload?.dog) {
      return h.response().code(400)
    }

    await addImportedDog(request.payload.dog, getCallingUser(request))

    return h.response('ok').code(200)
  }
},
{
  method: 'PUT',
  path: '/dog',
  options: { tags: ['api'] },
  handler: async (request, h) => {
    if (!request.payload?.indexNumber) {
      return h.response().code(400)
    }

    try {
      const updatedDog = await updateDog(request.payload, getCallingUser(request))

      return h.response(updatedDog).code(200)
    } catch (e) {
      console.log(`Error updating dog: ${e}`)
      throw e
    }
  }
}]
