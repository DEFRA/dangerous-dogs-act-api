const sequelize = require('../config/db')
const { v4: uuidv4 } = require('uuid')
const { deepClone } = require('../lib/deep-clone')
const constants = require('../constants/statuses')
const { getBreed, getExemptionOrder } = require('../lookups')
const { updateSearchIndexDog } = require('../repos/search')
const { updateMicrochips, createMicrochip } = require('./microchip')
const { createInsurance } = require('./insurance')
const { sendCreateToAudit, sendUpdateToAudit } = require('../messaging/send-audit')
const { DOG } = require('../constants/event/audit-event-object-types')

const getBreeds = async () => {
  try {
    const breeds = await sequelize.models.dog_breed.findAll({
      attributes: ['id', 'breed', 'display_order'],
      order: [
        ['display_order', 'ASC'],
        ['breed', 'ASC']
      ]
    })

    return breeds
  } catch (err) {
    console.error(`Error retrieving dog breeds: ${err}`)
    throw err
  }
}

const getStatuses = async () => {
  try {
    const statuses = await sequelize.models.status.findAll({
      attributes: ['id', 'status', 'status_type'],
      order: [
        ['id', 'ASC']
      ]
    })

    return statuses
  } catch (err) {
    console.error(`Error retrieving statuses: ${err}`)
    throw err
  }
}

const createDogs = async (dogs, owners, enforcement, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => createDogs(dogs, owners, enforcement, t))
  }

  try {
    const createdDogs = []

    const statuses = await getStatuses()

    for (const dog of dogs) {
      const breed = await getBreed(dog.breed)

      const dogEntity = await sequelize.models.dog.create({
        id: dog.indexNumber ?? undefined,
        name: dog.name,
        dog_breed_id: breed.id,
        exported: false,
        status_id: dog.source === 'ROBOT'
          ? getStatusId(statuses, constants.statuses.Exempt)
          : getStatusId(statuses, constants.statuses.PreExempt),
        dog_reference: uuidv4(),
        sex: dog.sex,
        colour: dog.colour,
        birth_date: dog.birthDate
      }, { transaction })

      const dogResult = await sequelize.models.dog.findByPk(dogEntity.id, {
        include: [{
          attributes: ['breed'],
          model: sequelize.models.dog_breed,
          as: 'dog_breed'
        }],
        raw: true,
        nest: true,
        transaction
      })

      let exemptionOrder

      if (dog.source === 'ROBOT') {
        exemptionOrder = await getExemptionOrder('2023')
      } else {
        exemptionOrder = await getExemptionOrder('2015')
      }

      const registrationEntity = await sequelize.models.registration.create({
        dog_id: dogEntity.id,
        cdo_issued: dog.cdoIssued,
        cdo_expiry: dog.cdoExpiry,
        police_force_id: enforcement.policeForce,
        court_id: enforcement.court,
        legislation_officer: enforcement.legislationOfficer,
        status_id: 1,
        certificate_issued: dog.certificateIssued,
        exemption_order_id: exemptionOrder.id,
        application_fee_paid: dog.applicationFeePaid,
        microchip_deadline: dog.microchipDeadline,
        neutering_deadline: dog.neuteringDeadline
      }, { transaction })

      if (dog.insurance) {
        await createInsurance(dogEntity.id, dog.insurance, transaction)
      }

      const createdRegistration = await sequelize.models.registration.findByPk(registrationEntity.id, {
        include: [{
          attributes: ['name'],
          model: sequelize.models.police_force,
          as: 'police_force'
        },
        {
          attributes: ['name'],
          model: sequelize.models.court,
          as: 'court'
        }],
        raw: true,
        nest: true,
        transaction
      })

      if (dog.microchipNumber) {
        await createMicrochip(dog.microchipNumber, dogEntity.id, transaction)
      }

      for (const owner of owners) {
        await sequelize.models.registered_person.create({
          person_id: owner.id,
          dog_id: dogEntity.id,
          person_type_id: 1
        }, { transaction })
      }

      createdDogs.push({ ...dogResult, registration: createdRegistration })
    }

    return createdDogs
  } catch (err) {
    console.error(`Error creating dog: ${err}`)
    throw err
  }
}

const getStatusId = (statuses, statusName) => {
  return statuses.filter(x => x.status === statusName)[0].id
}

const addImportedRegisteredPerson = async (personId, personTypeId, dogId, t) => {
  const registeredPerson = {
    person_id: personId,
    dog_id: dogId,
    person_type_id: personTypeId
  }
  await sequelize.models.registered_person.create(registeredPerson, { transaction: t })
}

const addImportedDog = async (dog, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => addImportedDog(dog, user, t))
  }

  const newDog = await sequelize.models.dog.create(dog, { transaction })

  if (dog.microchip_number) {
    await createMicrochip(dog.microchip_number, newDog.id, transaction)
  }

  if (dog.owner) {
    await addImportedRegisteredPerson(dog.owner, 1, newDog.id, transaction)
  }

  await sendCreateToAudit(DOG, dog, user)

  return newDog.id
}

const updateDog = async (payload, user, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => updateDog(payload, user, t))
  }

  const dogFromDB = await getDogByIndexNumber(payload.indexNumber)

  const preChangedDog = deepClone(dogFromDB)

  const breeds = await getBreeds()

  const statuses = await getStatuses()

  updateDogFields(dogFromDB, payload, breeds, statuses)

  await updateMicrochips(dogFromDB, payload, transaction)

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(payload.indexNumber, transaction)

  await updateSearchIndexDog(refreshedDog, statuses, transaction)

  await sendUpdateToAudit(DOG, preChangedDog, refreshedDog, user)

  return dogFromDB
}

const updateStatus = async (indexNumber, newStatus, transaction) => {
  if (!transaction) {
    return sequelize.transaction(async (t) => updateStatus(indexNumber, newStatus, t))
  }

  const statuses = await getStatuses()

  const dogFromDB = await getDogByIndexNumber(indexNumber, transaction)

  dogFromDB.status_id = statuses.filter(x => x.status === newStatus)[0].id

  await dogFromDB.save({ transaction })

  const refreshedDog = await getDogByIndexNumber(indexNumber, transaction)

  await updateSearchIndexDog(refreshedDog, statuses, transaction)
}

const updateDogFields = (dbDog, payload, breeds, statuses) => {
  autoChangeStatus(dbDog, payload, statuses)
  dbDog.dog_breed_id = breeds.filter(x => x.breed === payload.breed)[0].id
  dbDog.name = payload.name
  dbDog.birth_date = payload.dateOfBirth
  dbDog.death_date = payload.dateOfDeath
  dbDog.tattoo = payload.tattoo
  dbDog.colour = payload.colour
  dbDog.sex = payload.sex
  dbDog.exported_date = payload.dateExported
  dbDog.stolen_date = payload.dateStolen
  dbDog.untraceable_date = payload.dateUntraceable
}

const autoChangeStatus = (dbDog, payload, statuses) => {
  if ((!dbDog.death_date && payload.dateOfDeath) ||
      (!dbDog.exported_date && payload.dateExported) ||
      (!dbDog.stolen_date && payload.dateStolen) ||
      (!dbDog.untraceable_date && payload.dateUntraceable)) {
    dbDog.status_id = statuses.filter(x => x.status === constants.statuses.Inactive)[0].id
  } else {
    dbDog.status_id = payload.status ? statuses.filter(x => x.status === payload.status)[0].id : dbDog.status_id
  }
}

const getDogByIndexNumber = async (indexNumber, t) => {
  const dog = await sequelize.models.dog.findOne({
    where: { index_number: indexNumber },
    include: [{
      model: sequelize.models.registered_person,
      as: 'registered_person',
      include: [{
        model: sequelize.models.person,
        as: 'person',
        include: [{
          model: sequelize.models.person_address,
          as: 'addresses',
          include: [{
            model: sequelize.models.address,
            as: 'address',
            include: [{
              attribute: ['country'],
              model: sequelize.models.country,
              as: 'country'
            }]
          }]
        },
        {
          model: sequelize.models.person_contact,
          as: 'person_contacts',
          include: [{
            model: sequelize.models.contact,
            as: 'contact',
            include: [{
              model: sequelize.models.contact_type,
              as: 'contact_type'
            }]
          }]
        }]
      },
      {
        model: sequelize.models.person_type,
        as: 'person_type'
      }]
    },
    {
      model: sequelize.models.dog_breed,
      as: 'dog_breed'
    },
    {
      model: sequelize.models.dog_microchip,
      as: 'dog_microchips',
      include: [{
        model: sequelize.models.microchip,
        as: 'microchip'
      }]
    },
    {
      model: sequelize.models.status,
      as: 'status'
    }],
    transaction: t
  })

  return dog
}

const getAllDogIds = async () => {
  return sequelize.models.dog.findAll({ attributes: ['id'] })
}

module.exports = {
  getBreeds,
  getStatuses,
  createDogs,
  addImportedDog,
  updateDog,
  getAllDogIds,
  getDogByIndexNumber,
  updateDogFields,
  updateMicrochips,
  updateStatus
}
