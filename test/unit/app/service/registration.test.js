describe('RegistrationService', function () {
  /**
   * @type {UserAccountRepository}
   */
  let mockUserAccountRepository
  let regService

  jest.mock('../../../../app/messaging/send-email')
  const { sendEmail } = require('../../../../app/messaging/send-email')

  const { RegistrationService, actionResults } = require('../../../../app/service/registration')

  beforeEach(function () {
    jest.clearAllMocks()
    sendEmail.mockResolvedValue()

    // Create a mock UserAccountRepository
    /**
     * @type {UserAccountRepository}
     */
    mockUserAccountRepository = {
      getAccount: jest.fn(),
      setActivationCodeAndExpiry: jest.fn()
    }

    // Instantiate RegistrationService with the mock repository
    regService = new RegistrationService(mockUserAccountRepository)
  })

  describe('generateOneTimeCode', function () {
    test('should return a random code between 1 and 999999', () => {
      let result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
      result = regService.GenerateOneTimeCode()
      expect(result.length).toEqual(6)
    })
  })

  describe('sendVerifyEmailAddress', function () {
    test('should send code in email', async () => {
      await regService.SendVerifyEmailAddress('user@test.com')
      expect(sendEmail).toHaveBeenCalledWith({
        type: 'verify-email',
        toAddress: 'user@test.com',
        customFields: [
          { name: 'one_time_code', value: expect.anything() },
          { name: 'expiry_in_mins', value: '8' }
        ]
      })
    })
  })

  describe('VerifyAccountActivation', function () {
    test('should return ACCOUNT_NOT_FOUND if no account', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue(null)
      const res = await regService.VerifyAccountActivation('user@test.com', '123456')
      expect(res).toBe(actionResults.ACCOUNT_NOT_FOUND)
    })

    test('should return ACCOUNT_NOT_ENABLED if account not enabled', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: false })
      const res = await regService.VerifyAccountActivation('user@test.com', '123456')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ENABLED)
    })

    test('should return ACTIVATION_CODE_EXPIRED if code expired', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() - 1 })
      const res = await regService.VerifyAccountActivation('user@test.com', '123456')
      expect(res).toBe(actionResults.ACTIVATION_CODE_EXPIRED)
    })

    test('should return INVALID_ACTIVATION_CODE if wrong code', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() + 1 })
      const res = await regService.VerifyAccountActivation('user@test.com', '111111')
      expect(res).toBe(actionResults.INVALID_ACTIVATION_CODE)
    })

    test('should return SUCCESSFUL_ACTIVATION if everything is good', async () => {
      const mockSave = jest.fn()
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activation_token: '123456', activation_token_expiry: new Date() + 1, save: mockSave })
      const res = await regService.VerifyAccountActivation('user@test.com', '123456')
      expect(res).toBe(actionResults.SUCCESSFUL_ACTIVATION)
      expect(mockSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('VerifyLogin', function () {
    test('should return ACCOUNT_NOT_FOUND if no account', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue(null)
      const res = await regService.VerifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_FOUND)
    })

    test('should return ACCOUNT_NOT_ENABLED if account not enabled', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: false })
      const res = await regService.VerifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ENABLED)
    })

    test('should return ACCOUNT_NOT_ACTIVATED if account not activated', async () => {
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true })
      const res = await regService.VerifyLogin('user@test.com')
      expect(res).toBe(actionResults.ACCOUNT_NOT_ACTIVATED)
    })

    test('should return MUST_ACCEPT_TS_AND_CS if terms and conds not accepted yet', async () => {
      const mockSave = jest.fn()
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), save: mockSave })
      const res = await regService.VerifyLogin('user@test.com')
      expect(res).toBe(actionResults.MUST_ACCEPT_TS_AND_CS)
    })

    test('should return SUCCESSFUL_LOGIN if all good', async () => {
      const mockSave = jest.fn()
      mockUserAccountRepository.getAccount.mockResolvedValue({ active: true, activated_date: new Date(), accepted_terms_and_conds_date: new Date(), save: mockSave })
      const res = await regService.VerifyLogin('user@test.com')
      expect(res).toBe(actionResults.SUCCESSFUL_LOGIN)
    })
  })
})
