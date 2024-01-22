jest.mock('read-excel-file/node')
const mockReadXlsxFile = require('read-excel-file/node')

const mockRegister = require('../../../../mocks/register/register-xlsx')

jest.mock('../../../../../app/import/robot/police')
const { lookupPoliceForceByPostcode } = require('../../../../../app/import/robot/police')

jest.mock('../../../../../app/lookups/police-force')
const getPoliceForce = require('../../../../../app/lookups/police-force')

const { importRegister } = require('../../../../../app/import/robot')

describe('register import', () => {
  beforeEach(() => {
    mockReadXlsxFile.mockReturnValue(mockRegister)
    getPoliceForce.mockResolvedValue({ id: 1, name: 'police force 1' })
    lookupPoliceForceByPostcode.mockResolvedValue({ name: 'police force 1' })
  })

  test('should return register rows from xlsx', async () => {
    const { add } = await importRegister([])

    expect(mockReadXlsxFile).toHaveBeenCalledTimes(1)
    expect(add).toHaveLength(3)
  })

  test('should error when no xlsx file', async () => {
    mockReadXlsxFile.mockImplementation(() => { throw new Error('dummy error') })
    await expect(importRegister([])).rejects.toThrow('dummy error')
  })

  test('should group approved dogs under owner', async () => {
    const { add } = await importRegister([])

    const owner = add.find(p => p.owner.lastName === 'Poppins')

    expect(owner.dogs).toHaveLength(3)

    expect(owner.dogs[0].name).toEqual('Fred')
    expect(owner.dogs[0].colour).toEqual('Brown')

    expect(owner.dogs[1].name).toEqual('Max')
    expect(owner.dogs[1].colour).toEqual('grey')
  })

  test('should find police force', async () => {
    const { add } = await importRegister([])

    expect(add).toHaveLength(3)
    expect(add[0].owner.policeForceId).toBe(1)
  })

  test('should add error if cant find police force', async () => {
    lookupPoliceForceByPostcode.mockResolvedValue(null)

    const { add, errors } = await importRegister([])

    expect(add).toHaveLength(0)
    expect(errors[0].errors).toBe('Cannot find police force for postcode AA1 1AA')
  })
})
