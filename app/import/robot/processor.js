const { createCdo } = require('../../repos/cdo')
const { addYears } = require('date-fns')
const { calculateNeuteringDeadline } = require('../../dto/dto-helper')
const { lookupPoliceForceByPostcode } = require('./police')
const getPoliceForce = require('../../lookups/police-force')
const sequelize = require('../../config/db')
const { dbFindOne } = require('../../lib/db-functions')
const { log } = require('../../lib/import-helper')
const { robotImportUser } = require('../../constants/import')
const { ownerSearch } = require('../../import/robot/owner-search')

const processRegisterRows = async (register, t) => {
  let currentDataRow
  register.log = register.log || []
  for (const record of register.add) {
    const owner = record.owner

    owner.phoneNumber = `${owner.phoneNumber}`.startsWith('0') ? `${owner.phoneNumber}` : `0${owner.phoneNumber}`

    const data = {
      owner: {
        ...owner,
        primaryTelephone: owner.phoneNumber
      },
      dogs: record.dogs.map(d => ({
        ...d,
        source: 'ROBOT',
        breed: 'XL Bully',
        status: 'Exempt',
        sex: d.gender,
        colour: d.colour,
        microchipDeadline: new Date(2024, 2, 31),
        neuteringDeadline: calculateNeuteringDeadline(d.birthDate),
        applicationFeePaid: d.certificateIssued,
        insurance: {
          company: 'Dogs Trust',
          renewalDate: addYears(d.insuranceStartDate, 1)
        }
      })),
      enforcementDetails: {
        cdoIssued: null,
        cdoExpiry: null,
        policeForce: owner.policeForceId
      }
    }

    currentDataRow = data

    try {
      await isExistingPerson(data, register.log)
      await createCdo(data, robotImportUser, t)
    } catch (err) {
      log(register.log, `Row in error: ${JSON.stringify(currentDataRow)} - ${err}`)
    }
  }
}

const populatePoliceForce = async (register, rollback, transaction) => {
  register.log = register.log || []
  for (const record of register.add) {
    const forceId = await lookupPoliceForce(record.owner.address.postcode)

    if (!forceId) {
      record.dogs.forEach(x => {
        log(register.log, `IndexNumber ${x.indexNumber} error: Cannot find police force for postcode ${record.owner.address.postcode}`)
      })
      continue
    }

    if (rollback) {
      continue
    }

    for (const dog of record.dogs) {
      const registration = await dbFindOne(sequelize.models.registration, {
        where: { dog_id: dog.indexNumber },
        transaction
      })

      if (!registration) {
        throw new Error(`CDO not found - indexNumber ${dog.indexNumber}`)
      }

      await sequelize.models.search_index.update({
        police_force_id: forceId
      },
      {
        where: { dog_id: dog.indexNumber },
        transaction
      })

      if (!registration.police_force_id) {
        registration.police_force_id = forceId
        await registration.save({ transaction })
      }
    }
  }
}

const lookupPoliceForce = async (postcode) => {
  const policeForce = await lookupPoliceForceByPostcode(postcode.replace(' ', ''))

  if (policeForce) {
    const force = await getPoliceForce(policeForce.name)

    if (force) {
      return force.id
    }
  }

  return null
}

const isExistingPerson = async (data, logBuffer) => {
  const criteria = {
    firstName: data.owner.firstName,
    lastName: data.owner.lastName,
    birthDate: data.owner.birthDate
  }

  const foundRef = await ownerSearch(criteria)
  if (foundRef) {
    data.owner.personReference = foundRef
    log(logBuffer, `IndexNumber ${data.dogs[0].indexNumber} - Existing owner '${data.owner.firstName} ${data.owner.lastName}' found - imported dogs will be added to this owner`)
  }
}

module.exports = {
  processRegisterRows,
  populatePoliceForce
}
