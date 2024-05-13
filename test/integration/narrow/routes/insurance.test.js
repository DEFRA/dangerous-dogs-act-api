const { DuplicateResourceError } = require('../../../../app/errors/duplicate-record')
const { NotFoundError } = require('../../../../app/errors/not-found')

describe('Insurance endpoint', () => {
  const { insuranceCompanies } = require('../../../mocks/insurance-companies')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/get-user')
  const { getCallingUser } = require('../../../../app/auth/get-user')

  jest.mock('../../../../app/repos/insurance')
  const { getCompanies, addCompany, deleteCompany } = require('../../../../app/repos/insurance')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /insurance/companies', () => {
    test('GET /insurance/companies route returns 200', async () => {
      getCompanies.mockResolvedValue(insuranceCompanies)

      const options = {
        method: 'GET',
        url: '/insurance/companies'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
    })

    test('GET /insurance/companies route returns insurance companies', async () => {
      getCompanies.mockResolvedValue(insuranceCompanies)

      const options = {
        method: 'GET',
        url: '/insurance/companies'
      }

      const response = await server.inject(options)
      const { companies } = JSON.parse(response.payload)

      expect(companies).toHaveLength(3)
      expect(companies).toContainEqual({ id: 1, name: 'Gotham City Dog Insurance' })
      expect(companies).toContainEqual({ id: 2, name: 'Metropolis Insurance' })
      expect(companies).toContainEqual({ id: 3, name: 'Smallville Pet Emporium' })
    })

    test('GET /insurance/companies route returns 500 if db error', async () => {
      getCompanies.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/insurance/companies'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /insurance/companies', () => {
    getCallingUser.mockReturnValue({
      username: 'internal-user',
      displayname: 'User, Internal'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return 201', async () => {
      addCompany.mockResolvedValue({
        id: 2,
        name: 'Gotham City Dog Insurance'
      })
      const options = {
        method: 'POST',
        url: '/insurance/companies',
        payload: {
          name: 'Gotham City Dog Insurance'
        }
      }

      const response = await server.inject(options)
      const court = JSON.parse(response.payload)
      expect(response.statusCode).toBe(201)

      expect(court).toEqual({
        id: 2,
        name: 'Gotham City Dog Insurance'
      })
    })

    test('should return a 400 given schema is invalid', async () => {
      const options = {
        method: 'POST',
        url: '/insurance/companies',
        payload: {}
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 409 given DuplicateResourceError error', async () => {
      addCompany.mockRejectedValue(new DuplicateResourceError())

      const options = {
        method: 'POST',
        url: '/insurance/companies',
        payload: {
          name: 'Gotham City Dog Insurance'
        }
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(409)
    })

    test('should return 500 given db error', async () => {
      addCompany.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'POST',
        url: '/insurance/companies',
        payload: {
          name: 'Gotham City Dog Insurance'
        }
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  describe('DELETE /insurance/companies', () => {
    getCallingUser.mockReturnValue({
      username: 'internal-user',
      displayname: 'User, Internal'
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('should return 204', async () => {
      deleteCompany.mockResolvedValue({
        id: 1,
        name: 'Gotham City Dog Insurance'
      })
      const options = {
        method: 'DELETE',
        url: '/insurance/companies/1'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(204)

      expect(response.payload).toBe('')
    })

    test('should return 409 given NotFoundError error', async () => {
      deleteCompany.mockRejectedValue(new NotFoundError())

      const options = {
        method: 'DELETE',
        url: '/insurance/companies/1'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(404)
    })

    test('should return 500 given db error', async () => {
      deleteCompany.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'DELETE',
        url: '/insurance/companies/1'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
