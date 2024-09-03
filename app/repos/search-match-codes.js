const sequelize = require('../config/db')
const fuzzyAlgo1 = require('talisman/phonetics/daitch-mokotoff')
const nysiis = require('talisman/phonetics/nysiis')
const fuzzyAlgo2 = nysiis.refined
const { matchCodeSearchFields } = require('../constants/search')
const { getFieldValue } = require('../lib/field-helpers')

const matchCodesForTerm = (term, simple = false) => {
  const lowerTerm = term.toLowerCase()
  return simple ? fuzzyAlgo1(lowerTerm) : fuzzyAlgo1(lowerTerm).concat([fuzzyAlgo2(lowerTerm)])
}

const populateMatchCodes = async () => {
  const searchRows = await sequelize.models.search_index.findAll()

  await sequelize.models.search_match_code.truncate()

  for (let rowNum = 0; rowNum < searchRows.length; rowNum++) {
    await insertPersonMatchCodes(searchRows[rowNum])
  }
}

const insertPersonMatchCodes = async (searchRow, transaction) => {
  for (let fieldNum = 0; fieldNum < matchCodeSearchFields.length; fieldNum++) {
    const field = matchCodeSearchFields[fieldNum]
    const fieldValue = getFieldValue(searchRow.json, field.fieldName)
    await insertMatchCode(searchRow.person_id, fieldValue, field.simple, transaction)
  }
}

const insertMatchCode = async (personId, fieldValue, simple, transaction) => {
  if (fieldValue && fieldValue !== '') {
    const codes = matchCodesForTerm(fieldValue, simple)
    for (let c = 0; c < codes.length; c++) {
      await sequelize.models.search_match_code.create({
        person_id: personId,
        match_code: codes[c]
      },
      { transaction })
    }
  }
}

const updateMatchCodesPerPerson = async (personId, row, transaction) => {
  await sequelize.models.search_match_code.destroy({ where: { person_id: personId }, force: true }, { transaction })
  await insertPersonMatchCodes(row)
}

const buildFuzzyCodes = (terms) => {
  const fuzzyCodes = []
  terms.forEach(term => {
    const matchCodes = matchCodesForTerm(term)
    matchCodes.forEach(code => fuzzyCodes.push(code))
  })
  return fuzzyCodes
}

const fuzzySearch = async (terms) => {
  const fuzzyCodes = buildFuzzyCodes(terms)
  /*
  const fuzzyResults = await sequelize.models.search_match_code.findAll({
    attributes: ['person_id', [sequelize.fn('count', sequelize.col('search_match_code.person_id')), 'matchcount']],
    where: {
      match_code: fuzzyCodes
    },
    group: ['person_id'],
    order: [['matchcount', 'DESC']],
    raw: true
  })
  const numResults = fuzzyResults.length
  const uniquePersons = []
  if (numResults > 0) {
    const highestMatch = parseInt(fuzzyResults[0].matchcount)
    console.log('high', highestMatch)
    const matchThreshold = 1 // highestMatch / 4
    fuzzyResults.forEach(res => {
      if (parseInt(res.matchcount) >= matchThreshold && !uniquePersons.includes(res.person_id)) {
        uniquePersons.push(res.person_id)
      }
    })
  */
  const fuzzyResults = await sequelize.models.search_match_code.findAll({
    where: {
      match_code: fuzzyCodes
    }
  })
  const uniquePersons = []
  fuzzyResults.forEach(res => {
    if (!uniquePersons.includes(res.person_id)) {
      uniquePersons.push(res.person_id)
    }
  })
  return uniquePersons
}

module.exports = {
  populateMatchCodes,
  fuzzySearch,
  insertPersonMatchCodes,
  updateMatchCodesPerPerson
}
