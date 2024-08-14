const sequelize = require('../config/db')
const { Op } = require('sequelize')
const { sortAndGroupResults } = require('./search/sorting-and-grouping')
const { cleanupSearchTerms } = require('./search/search-terms')
const { mapResults } = require('./search/search-results')
const { fuzzySearch, rankResult, trigramSearch } = require('../repos/match-codes')
const { buildTsVectorQuery } = require('./search/search-builder')

const trigramQueryThreshold = 0.6
const trigramRankThreshold = 1.001
const fuzzyRankThreshold = 1.001
const fullTextRankThreshold = 1.0

const rankAndKeep = (results, terms, threshold, type) => {
  const toKeep = []

  results.forEach(res => {
    res.rank = rankResult(terms, res, type)
    if (res.rank >= threshold) {
      toKeep.push(res)
    }
  })

  return toKeep
}

const doFullTextSearch = async (terms, type, fuzzy) => {
  const termsQuery = buildTsVectorQuery(terms, fuzzy)

  const results = await sequelize.models.search_index.findAll({
    where: {
      search: {
        [Op.match]: sequelize.fn('to_tsquery', termsQuery)
      }
    }
  })

  console.log('fullTextFirstPass', results.length)

  return rankAndKeep(results, terms, fullTextRankThreshold, type)
}

const doFuzzySearch = async (terms, type) => {
  const fuzzyPersonIds = await fuzzySearch(terms)

  const results = await sequelize.models.search_index.findAll({
    where: {
      person_id: fuzzyPersonIds
    }
  })

  console.log('fuzzyFirstPass', results.length)

  return rankAndKeep(results, terms, fuzzyRankThreshold, type)
}

const doTrigramSearch = async (terms, type) => {
  const { uniquePersons, uniqueDogs } = await trigramSearch(terms, trigramQueryThreshold)

  const results = await sequelize.models.search_index.findAll({
    where: {
      [Op.or]: [
        { person_id: uniquePersons },
        { dog_id: uniqueDogs }
      ]
    }
  })

  console.log('trigramFirstPass', results.length)

  return rankAndKeep(results, terms, trigramRankThreshold, type)
}

const search = async (type, terms, fuzzy = false) => {
  if (terms === null || terms === undefined) {
    return []
  }

  const termsArray = cleanupSearchTerms(terms)

  const fullTextToKeep = await doFullTextSearch(termsArray, type, fuzzy)

  const fuzzyToKeep = fuzzy ? await doFuzzySearch(termsArray, type) : []

  const trigramToKeep = fuzzy ? await doTrigramSearch(termsArray, type) : []

  console.log('fullTextToKeep', fullTextToKeep.length)
  console.log('fuzzyToKeep', fuzzyToKeep.length)
  console.log('trigramToKeep', trigramToKeep.length)

  const results = fullTextToKeep.concat(fuzzyToKeep).concat(trigramToKeep)
  const mappedResults = mapResults(results, type)

  return sortAndGroupResults(mappedResults, type)
}

module.exports = {
  search
}
