describe('Police force endpoint', () => {
  const { forces: mockForces } = require('../../../mocks/police-forces')

  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/police-forces')
  const { getForces } = require('../../../../app/repos/police-forces')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  test('GET /police-force route returns 200', async () => {
    getForces.mockResolvedValue(mockForces)

    const options = {
      method: 'GET',
      url: '/police-forces'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /police-force route returns forces', async () => {
    getForces.mockResolvedValue(mockForces)

    const options = {
      method: 'GET',
      url: '/police-forces'
    }

    const response = await server.inject(options)
    const { forces } = JSON.parse(response.payload)

    expect(forces).toHaveLength(3)
    expect(forces).toContainEqual({ id: 1, name: 'Northern Constabulary' })
    expect(forces).toContainEqual({ id: 2, name: 'Southern Constabulary' })
    expect(forces).toContainEqual({ id: 3, name: 'Eastern Constabulary' })
  })

  test('GET /police-force route returns 500 if db error', async () => {
    getForces.mockRejectedValue(new Error('Test error'))

    const options = {
      method: 'GET',
      url: '/police-forces'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })
})
