const { countsPerStatus: mockCountsPerStatus } = require('../../../mocks/statistics')

describe('Statistics endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/repos/statistics')
  const { getCountsPerStatus } = require('../../../../app/repos/statistics')

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  describe('GET /statistics?queryName=countsPerStatus', () => {
    test('route returns 200', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryName=countsPerStatus'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.result[0].status.name).toBe('Interim exempt')
      expect(response.result[0].total).toBe(20)
      expect(response.result[1].status.name).toBe('Pre-exempt')
      expect(response.result[1].total).toBe(30)
      expect(response.result[2].status.name).toBe('Failed')
      expect(response.result[2].total).toBe(40)
      expect(response.result[3].status.name).toBe('Exempt')
      expect(response.result[3].total).toBe(500)
      expect(response.result[4].status.name).toBe('In breach')
      expect(response.result[4].total).toBe(60)
      expect(response.result[5].status.name).toBe('Withdrawn')
      expect(response.result[5].total).toBe(70)
      expect(response.result[6].status.name).toBe('Inactive')
      expect(response.result[6].total).toBe(80)
    })

    test('route returns 400 if invalid param key name', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryNameInvalid=countsPerStatus'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 400 if invalid param value', async () => {
      getCountsPerStatus.mockResolvedValue(mockCountsPerStatus)

      const options = {
        method: 'GET',
        url: '/statistics?queryName=invalidQuery'
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('route returns 500 if db error', async () => {
      getCountsPerStatus.mockRejectedValue(new Error('Test error'))

      const options = {
        method: 'GET',
        url: '/statistics?queryName=countsPerStatus'
      }

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
