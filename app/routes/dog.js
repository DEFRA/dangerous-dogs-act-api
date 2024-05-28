const { getCallingUser } = require('../auth/get-user')
const { dogsQueryParamsSchema } = require('../schema/dogs/get')
const { addImportedDog, updateDog, getDogByIndexNumber, deleteDogByIndexNumber, getDogsForPurging } = require('../repos/dogs')
const { dogDto } = require('../dto/dog')
const { personDto, mapPersonAndDogsByIndexDao } = require('../dto/person')
const { getOwnerOfDog, getPersonAndDogsByIndex } = require('../repos/people')

module.exports = [
  {
    method: 'GET',
    path: '/dog/{indexNumber}',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      try {
        const dog = await getDogByIndexNumber(indexNumber)

        if (dog === null) {
          return h.response().code(404)
        }

        return h.response({ dog: dogDto(dog) }).code(200)
      } catch (e) {
        console.log('Error in GET /dog', e)
        throw e
      }
    }
  },
  {
    method: 'GET',
    path: '/dog-owner/{indexNumber}',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber
      let ownerDao
      let owner

      try {
        if (request.query.includeDogs === 'true') {
          ownerDao = await getPersonAndDogsByIndex(indexNumber)
        } else {
          ownerDao = await getOwnerOfDog(indexNumber)
        }

        if (ownerDao === null) {
          return h.response().code(404)
        }

        if (request.query.includeDogs === 'true') {
          owner = mapPersonAndDogsByIndexDao(ownerDao)
        } else {
          owner = personDto(ownerDao.person, true)
        }

        return h.response({ owner }).code(200)
      } catch (e) {
        console.log('Error in GET /dog-owner', e)
        throw e
      }
    }
  },
  {
    method: 'POST',
    path: '/dog',
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
    handler: async (request, h) => {
      if (!request.payload?.indexNumber) {
        return h.response().code(400)
      }

      try {
        const updatedDog = await updateDog(request.payload, getCallingUser(request))

        return h.response(updatedDog).code(200)
      } catch (e) {
        console.log('Error updating dog:', e)
        throw e
      }
    }
  },
  {
    method: 'DELETE',
    path: '/dog/{indexNumber}',
    handler: async (request, h) => {
      const indexNumber = request.params.indexNumber

      const dog = await getDogByIndexNumber(indexNumber)

      if (dog === null) {
        return h.response().code(404)
      }

      try {
        await deleteDogByIndexNumber(indexNumber, getCallingUser(request))

        return h.response().code(204)
      } catch (e) {
        console.log('Error updating dog:', e)
        throw e
      }
    }
  },
  {
    method: 'GET',
    path: '/dogs',
    options: {
      validate: {
        query: dogsQueryParamsSchema,
        failAction: (request, h, error) => {
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        let dogs

        if (request.query.forPurging === 'true') {
          dogs = await getDogsForPurging('Pre-exempt,Exempt', { sortKey: 'indexNumber', sortOrder: 'ASC' }) // , new Date(2038, 2, 2))
          console.log('Dog count', dogs.length)
        }

        return h.response(dogs).code(200)
      }
    }
  }
]
