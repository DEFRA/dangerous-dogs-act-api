const { expectDate } = require('../../../time-helper')
const { mockValidate, mockValidateEnforcement, mockValidateStandard } = require('../../../mocks/auth')
const { portalHeader, enforcementHeader, portalStandardHeader } = require('../../../mocks/jwt')

describe('Jobs endpoint', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/token-validator')
  const { validate } = require('../../../../app/auth/token-validator')

  jest.mock('../../../../app/repos/regular-jobs')
  const { hasJobRunBefore } = require('../../../../app/repos/regular-jobs')

  jest.mock('../../../../app/overnight/purge-soft-deleted-records')
  const { purgeSoftDeletedRecords } = require('../../../../app/overnight/purge-soft-deleted-records')

  jest.mock('../../../../app/overnight/expired-insurance')
  const { setExpiredInsuranceToBreach, addBreachReasonToExpiredInsurance } = require('../../../../app/overnight/expired-insurance')

  jest.mock('../../../../app/overnight/revert-expired-insurance')
  const { revertExpiredInsurance } = require('../../../../app/overnight/revert-expired-insurance')

  jest.mock('../../../../app/overnight/expired-neutering-deadline')
  const { setExpiredNeuteringDeadlineToInBreach, addBreachReasonToExpiredNeuteringDeadline } = require('../../../../app/overnight/expired-neutering-deadline')

  beforeEach(async () => {
    jest.clearAllMocks()
    validate.mockResolvedValue(mockValidate)
    server = await createServer()
    await server.initialize()
  })

  describe('POST /jobs/purge-soft-delete', () => {
    test('should POST /jobs/purge-soft-delete route and return 200', async () => {
      const expectedDto = {
        count: {
          success: {
            dogs: 2,
            owners: 1,
            total: 3
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: ['ED100001', 'ED100002'],
            owners: ['P-1234-56']
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      }
      purgeSoftDeletedRecords.mockResolvedValue({
        ...expectedDto,
        toString: jest.fn()
      })

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(purgeSoftDeletedRecords.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('should POST /jobs/purge-soft-delete?today=2024-03-16', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({
        count: {
          success: {
            dogs: 0,
            owners: 0,
            total: 0
          },
          failed: {
            dogs: 0,
            owners: 0,
            total: 0
          }
        },
        deleted: {
          success: {
            dogs: [],
            owners: []
          },
          failed: {
            dogs: [],
            owners: []
          }
        }
      })

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(purgeSoftDeletedRecords).toHaveBeenCalledWith(new Date('2024-03-16'))
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })

    test('should return 500 with invalid response', async () => {
      purgeSoftDeletedRecords.mockResolvedValue({})

      const options = {
        method: 'POST',
        url: '/jobs/purge-soft-delete',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /jobs/expired-insurance', () => {
    test('POST /jobs/expired-insurance should return 200', async () => {
      const expectedDto = {
        response: 'Success Revert Insurance Expiry - updated 10 rowsSuccess Insurance Expiry add reason - updated 3 rowsSuccess Insurance Expiry to breach - updated 5 rows'
      }
      addBreachReasonToExpiredInsurance.mockResolvedValue('Success Insurance Expiry add reason - updated 3 rows')
      setExpiredInsuranceToBreach.mockResolvedValue('Success Insurance Expiry to breach - updated 5 rows')
      revertExpiredInsurance.mockResolvedValue('Success Revert Insurance Expiry - updated 10 rows')
      hasJobRunBefore.mockResolvedValue(false)

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(setExpiredInsuranceToBreach.mock.calls[0][0]).toBeNow()
      expectDate(revertExpiredInsurance.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('POST /jobs/expired-insurance should return 200 but not run revert if already run', async () => {
      const expectedDto = {
        response: 'Success Insurance Expiry add reason - updated 3 rowsSuccess Insurance Expiry to breach - updated 5 rows'
      }
      addBreachReasonToExpiredInsurance.mockResolvedValue('Success Insurance Expiry add reason - updated 3 rows')
      setExpiredInsuranceToBreach.mockResolvedValue('Success Insurance Expiry to breach - updated 5 rows')
      revertExpiredInsurance.mockResolvedValue('Success Revert Insurance Expiry - updated 10 rows')
      hasJobRunBefore.mockResolvedValue(true)

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(setExpiredInsuranceToBreach.mock.calls[0][0]).toBeNow()
      expect(revertExpiredInsurance).not.toHaveBeenCalled()
      expect(responseData).toEqual(expectedDto)
    })

    test('should POST /jobs/expired-insurance?today=2024-03-16', async () => {
      addBreachReasonToExpiredInsurance.mockResolvedValue('Success Insurance Expiry add reason - updated 3 rows')
      setExpiredInsuranceToBreach.mockResolvedValue('Success Insurance Expiry to breach - updated 5 rows')
      hasJobRunBefore.mockResolvedValue(true)

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(setExpiredInsuranceToBreach.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
      expect(addBreachReasonToExpiredInsurance.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
    })

    test('should return 403 given call from enforcement', async () => {
      hasJobRunBefore.mockResolvedValue(true)
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      hasJobRunBefore.mockResolvedValue(true)
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should 400 with invalid query props', async () => {
      hasJobRunBefore.mockResolvedValue(true)
      const options = {
        method: 'POST',
        url: '/jobs/expired-insurance?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /jobs/neutering-deadline', () => {
    test('POST /jobs/neutering-deadline should return 200', async () => {
      const expectedDto = {
        response: 'Success Neutering Expiry add reason - updated 3 rowsSuccess Neutering Expiry to breach - updated 5 rows'
      }
      addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('Success Neutering Expiry add reason - updated 3 rows')
      setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('Success Neutering Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline',
        ...portalHeader
      }

      const response = await server.inject(options)
      const responseData = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expectDate(setExpiredNeuteringDeadlineToInBreach.mock.calls[0][0]).toBeNow()
      expect(responseData).toEqual(expectedDto)
    })

    test('should return 403 given call from enforcement', async () => {
      validate.mockResolvedValue(mockValidateEnforcement)

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline',
        ...enforcementHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should return 403 given call from standard user', async () => {
      validate.mockResolvedValue(mockValidateStandard)

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline',
        ...portalStandardHeader
      }
      const response = await server.inject(options)
      expect(response.statusCode).toBe(403)
    })

    test('should POST /jobs/expired-insurance?today=2024-03-16', async () => {
      addBreachReasonToExpiredNeuteringDeadline.mockResolvedValue('Success Neutering Expiry add reason - updated 3 rows')
      setExpiredNeuteringDeadlineToInBreach.mockResolvedValue('Success Neutering Expiry to breach - updated 5 rows')

      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline?today=2024-03-16',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(addBreachReasonToExpiredNeuteringDeadline.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
      expect(setExpiredNeuteringDeadlineToInBreach.mock.calls[0][0]).toEqual(new Date('2024-03-16'))
    })

    test('should 400 with invalid query props', async () => {
      const options = {
        method: 'POST',
        url: '/jobs/neutering-deadline?unknown=true',
        ...portalHeader
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(400)
    })
  })

  afterEach(async () => {
    await server.stop()
  })
})
