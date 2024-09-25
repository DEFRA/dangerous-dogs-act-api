const { scopes } = require('../../app/constants/auth')
const devUser = {
  username: 'dev-user@test.com',
  displayname: 'Dev User'
}

const authHeaders = {
  headers: {
    'ddi-username': 'dev-user@test.com',
    'ddi-displayname': 'dev-user@test.com',
    authorization: 'Basic ZGV2LXVzZXJAdGVzdC5jb206QUJDREVGRzEyMzQ1Ng=='
  }
}

const mockValidate = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', scope: [scopes.admin] } }
const mockValidateStandard = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', scope: [scopes.standard] } }
const mockValidateEnforcement = { isValid: true, credentials: { id: 'dev-user@test.com', name: 'dev-user@test.com', scope: [scopes.enforcement] } }

module.exports = {
  devUser,
  authHeaders,
  mockValidate,
  mockValidateStandard,
  mockValidateEnforcement
}
