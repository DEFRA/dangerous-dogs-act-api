const sequelize = require('../config/db')
const { createPeople, getPersonByReference } = require('./people')
const { createDogs } = require('./dogs')
const { addToSearchIndex } = require('./search')
const { sendCreateToAudit } = require('../messaging/send-audit')
const { CDO } = require('../constants/event/audit-event-object-types')
const { NotFoundError } = require('../errors/notFound')
const { mapPersonDaoToCreatedPersonDao } = require('./mappers/person')
const { cdoRelationships } = require('./relationships/cdo')

const createCdo = async (data, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction((t) => createCdo(data, user, t))
  }

  try {
    let owners
    if (data.owner.personReference) {
      const person = await getPersonByReference(data.owner.personReference, transaction)
      if (person === null) {
        throw new NotFoundError('Owner not found')
      }

      owners = [mapPersonDaoToCreatedPersonDao(person)]
    } else {
      owners = await createPeople([data.owner], transaction)
    }

    const dogs = await createDogs(data.dogs, owners, data.enforcementDetails, transaction)

    for (const owner of owners) {
      for (const dog of dogs) {
        await addToSearchIndex(owner, dog, transaction)
        const entity = {
          owner,
          dog
        }
        await sendCreateToAudit(CDO, entity, user)
      }
    }

    const cdo = {
      owner: owners[0],
      dogs
    }

    return cdo
  } catch (err) {
    console.error(`Error creating CDO: ${err}`)
    throw err
  }
}

const getCdo = async (indexNumber) => {
  const cdo = await sequelize.models.dog.findAll({
    where: { index_number: indexNumber },
    order: [[sequelize.col('registered_person.person.addresses.address.id'), 'DESC'],
      [sequelize.col('dog_microchips.microchip.id'), 'ASC']],
    include: cdoRelationships
  })

  return cdo?.length > 0 ? cdo[0] : null
}

const getAllCdos = async () => {
  const cdos = await sequelize.models.dog.findAll({
    order: [
      [sequelize.col('dog.id'), 'ASC'],
      [sequelize.col('registered_person.person.addresses.address.id'), 'DESC']
    ],
    include: cdoRelationships
  })

  // Workaround due to Sequelize bug when using 'raw: true'
  // Multiple rows aren't returned from an array when using 'raw: true'
  // so the temporary solution is to omit 'raw: true'
  return cdos
}

module.exports = {
  createCdo,
  getCdo,
  getAllCdos
}
