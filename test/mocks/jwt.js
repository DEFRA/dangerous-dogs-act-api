const jwt = require('jsonwebtoken')

// These are fake keys used for testing
const portalPrivate = 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRREhzZkVBT29BMG81b3UKWWN3L21WaDd6QURMbER0SjhKQkxrL2dsTXpVcTFPZ244RmdlYjhFUVFrN1hueitmNDB0NE1FL3h5Zm5LdkFjaApQTzlzZlYwM2s0c1doR0NsS1M4SElNaUtOUFpUb3N1TjFvdG9sNDJhK3pnK21JYXJzdElla0dLSmtMWnEybnVUCnhwWUZYVTVPMFRuUjF4emU3TktBdk45L21NZWFpYUsraEd3THpON094K2xubW8vazlKMDM5dnAwODVicmszY0oKRFVUclhkeUdCbHE1RHZ2WkgxaFNsUCtaNnFjWFd3OFVCcjBGQVFnTkFQN1dGbkFPQWZkTGZaSVhqYWdjSUpLUwpOR1h2djdERHpOcU9BdmVkYkZjOWZjSUdzMTdpblljVnBQbnp6anMxZGdmVklhME9WWFA2T3VQRmZ2aWt2aTJMCk0xYUI5NlB2QWdNQkFBRUNnZ0VBUXp0WThPTkJRN2VyRXArUmhQNExTTTZ6bTliQnFWQ3BQQkRLMURkcjJJcEsKeVJ1RmgyWEhvY0k1U2lZTzVUVkF0T3ZMRnBRU0dkdjVLSXNiN3JJOFhwZzVsVENuV3lQRTlnam5DNFR1UTlWRQo0L0dPQ1A0eFNqTDNTamZPNjJLdWxHUzNFQ3FkQjllY0VISWxFeFJKWjRiUWlTSDcwZC80dFNnaHRSTktiRy8rCjFWenlxV2YvekxXam1YWUpoa0RCOGNyQTBqOWtZRjAvcVFJRVdBS0I2Smh2NGRuVklPNFhMODdvb2VQSUNuTnUKODRMMHFuUld4SjhhaEZ3ZFJQdGozWUc1QkFQbUJlVldmQXZpKzZyM1JaSUg1aERoY2lvUkdyM3M1NmtJQmtsQwpadVFiNzBRd1N6eCtBVXpVU1F4enJORkNYL2daYm1iRTVFSWhNQkNsalFLQmdRRHUzcjh3YVBPd2lYRkYrUjUvCjFjbTQ2bGh3cVBVZTl1dFphUjhyWmVjVTFYWlF3b2NoN3F5RDdUOFV3OE9JbFdHSmdRUWI3OG9yK3pyRnRJZnIKSFduREJNaFBGZXpNZFR5Z3hpdlhBczk4SEF5c1JmendYZDc1dCtLNDBJaDEvcFUwM3MrV293QTBmUnB5dXBvZQppaE1BYVh0N0F2R21vbVRMUzI0VTdNVHltd0tCZ1FEV0JBSFI4N2g5SGpSVkhWU1YvazVhSXRWVnVENk5maExPCkNSTUZKRG4zbjZSMWxVS0lncjBKZEYySGR2clJBRmVLNDRhZGtBWnNUZklSRy9VQjA0MVJNajJRM0hTV3ZJSFgKbmg1ZTBOYUh4NlhaZ0hveVdiY2hjbmtWOTZZcndkZkgwZFJGTllERzhXTEJkTDFja2Vnd09PYTZNek1VRk9ZagoyMjdsRFVSUFBRS0JnRDU2dU50NnVETDI0RkFESnowY3VGVEx4ekpBbjB6b0hRc1grZlVxQkZWb3VEZkxpZmtRCktzT2ZMSjdMemJ0T0IyTW1BZU1reDJiVm9idlF5clJ1enhrWmlTTldnc2UvNm9uTEMvQ0RaYTM2MEQzSFdLK3UKZmdJblhRQW1XMnN4bWVsb1ZqZjZqclVyKzkwQ2ZnbDY2QmwxZmJ6aE9qL3h2aGVHdFZaM3o5UDlBb0dBSXpXWgpqdzhIeFIzWkFqL0hFTDQ3NmJ4ZFdMTHRKNTRjUGVWa1NhNUNFeWtpaDIyOCtuUjM0VHhSdnQybU9naFNYcms4CkJtUVJpblB3WlR3eVBOQ3ZLVEtZeW1KYWxBb0RXcFBhNzBKd2FQcEJvTnp3UGFSZzZwSEl0Z0orUmlpbjlXbmkKQUZqakROZmRwWEl0VFRONy9hTCs0cGRWeWZIK1F0dnhES0g0SVFrQ2dZRUF4RXlncHdibzFJWGZ5R1NianUrMApac253c2RhU0NMRFEyRVQ4VDV5aE1lNGhUWmF5aytQZlNqUXlsdVF5cVdoSmJxdEozblNJTnBUQ2FHRkhzRkNTCmtCZy9COVlqOXZoLy9vZmduYTdYVzFaOThTOUR3cHU3TzNpbEt2UVFsQm5OS280ZzA2KzRITXZBcjF3SkRRMy8KVjA0MEk3OC9qR1RlK011aE1MT3c4Qjg9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K'
const enforcementPrivate = 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQ1RSTkRaTkgwQlgvTUMKd292dzhBdEJJVCtBejBvN3BvZnkwYjl1ME40MW03VkJiSEU5ckIyU2JWcnl6UWVmQmxiS1dqaWR2eGplUm5EZwpmV1dVRXVOb0dKMmt5emZXeFoxeHVMVW9zdHYxekhSNDhOOVJmTGpMWjQzVmZUOHFDVk1nZUptZmJRM1RjTUNJCkZSTG14dG0wcUJXdG5lb0VPaGMvYjh1WmxZQ0ZyVW9XRnNsQi9JeG94OE5DZTZZK3ZvdlA2K2lJMDYxMkNjR1QKMG8yOHh0bG9jT3JTNUZnanlza1BEWjNqSHlTVkd4aVlXdlFLdG9tRlFkWUZaSUJIY2huZ294TXhGSDRQN25qNgo4d0hFMVllWlhHdzh4SUlxOHNnaWhBa2p2YS9uSlh4U05XTjZXZCthZ2hyaWg3cG8rZU5zTUUvY2hsUis4TjI3CjdCanBxN05aQWdNQkFBRUNnZ0VBQWp5cjNYakdJMVMxU01meXZ6eXVOeFdOdE9PeE1YbkVtK1FpdjhpdGIyd0gKazFCVjRnVnd4NDRnc1FwN1FLZWtmdHRpKzhadzFzT0VLR3pQTTdJYndUT0toWHZPdzlUcG9OWVk3bDdWSjRVdApDYjlDN1NaeldpZWZDR3lvSG5mWXl1ZjZFV2xqS2VDUEZDSVowT2FaWFB5bW82WC83WU9DWWVUTlYyNWxidUplCmtyTkZwbk1HZ1dLQ2tGcy9FcEhSZlZubWUxcHVIQ1prOUtrbTdyUmJLUmREbE9VUENzS1o4bk1nR1hRTGdkWTEKV21vL0V0cGwwNFcwem01Rk9TR3BWYU5YNCtTYWV6VDJ0RjlvNnJhNzREUVYyZFRzUUdlNlJrNzJNVEFBQzZuZgppSWhMczhZZnVSTXJ2b3RoazdmNVFwOTF3T0NIbk9LcC8wMnRTQjBnV1FLQmdRRE5mQzhZbzdKb0JCZWM5eGZXCjBTa2ZSNlRLNTlUcDg2V292U1crN1Z1VEtSSVEvbUgzdVBVeU5tN3hUK2d3d2doTFdOdk1lRWpncWdNQ2ZXdDcKa1lZWHY4S1Z1ekRXd3ZJOGg4dXNGQi8wVGNMLyszazgyU3h6VFB2R0ZUMm9YR1BHS2pCd3NpblVON2IyWmhsRwpIbFNGRVhDSTV6SW1kZGpkdWc5RFBTdkpqUUtCZ1FDM2VPWnhUUHVYbjNITldqbW5uYk05Sy95VlJUWnluT0NJCnNCTGdFNTY5bFFYMWJ3WlFoU2YwY0RJRE40QkFuY2xWbzJCdFhWVXUvQVpMdDRidCtqb1FjOE91WTJBbVlwbkUKaHk2M3c1SlNZUlQ1RWVnZGdSalZKWEtJTVkxNFpGVWovSnFOczRmK09FTGxUSEI2ODdhN2E2bzFNU3h6bmsxago2OVMyV3I5UC9RS0JnSFNiRWdiRGJneEV0am1tcG1xS3l2RXJNTUxNQ0RDeXlNRVdoUUx4b3RQQnJMVGtCaWdUClYyRWxMcFBWcW9kd3RGQTlubzFMZk4rdzJvQmhOOHNwYTVTeWh2TjlCRnY2eUllODc4RTRzbUZxZDB2WUlwWjcKRHhSbkRVRDg4TDVIbjM3bWxoSjlwK3I3cXVIc1VrOU9DdHh3WnhIcFVMWXVqZUJWSXpBZTJHaEpBb0dBUkdKSQpxaFJDZGlvVXRiQ2FhcklwdTNRb3FjNXBVK0RMQThkMDBaWWVoWlVFNm96ZU1xYmUxSW40NmlBR3FvN2xHd2xSCkNKSlFETG9jOHAzT0tlY3BPemFheWVYNlVYUlEwZUo4OUR0dHoweW1ENHV3RTBjcDVWQVcxMUo0NDFXcU1rYVYKcUprdzUvMDZXZExhM2NqMjQvWm1NM3RIa1RTQXJleVpsUHBQOGxVQ2dZRUFvcGNyZjVZMWE3aDdtWG9LOFZ1UAoybzRmWTIvRlhxVktBSjdBWDYrL0JqTXFhV2EybUFUZDkzQ0RUMVpUR2MrK0VhY1VBc3hpKzZuMWUycHBxSmp6ClhIcnhVVjE2SUJpV3h0bmZHRGNpRGFDWGNSK05yOS9pNHRocnd6dURqS25xN2p1S2ZzUHR5alRXTlVIdHU1NnIKRTdwK2RTNkRuNjA3dVNtYy9iMXdJNGc9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K'
const apiPrivate = 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRFdKTCs3TExDMmx0SlAKTkdvb0FzUTE2Y0l2R2hzU0lub2liRHQ2TGhtdFdqRWtYb1M3UUxOS0VhYzIyRXdwSjRDcTZ1cHRRSmtRSCsyVQpnNmltNko2aUVwR0hMZENoQVJlMFNhNVlWcUdiZzd1cDkrbGlXMkNiQkZsV3FVeEg4ZEorZUlIL3BCVEJ5Y3VtCkdDcHdvd1FUZlFCZDNrUmVXOEllU3lGZWJUMm9BVUw4YTZEMFBsTTJydThEb25ZeXY4QzJtcU5QVzNNU3NINVIKd1J1WlhBZWlxa1Y4RWxkOGc3OStJY0pXM0g1L081a2J3Z1RuUDhFYkI2MldHMklBa2twQWdnWXdxem8vUjhqUAo2dzY4Q0JNK29oZ3UvU1Aza2xxM2hUanRTbFFxM3N2ZlRVTlVaNmlLQ0hOQkhYRmlyUGRGUlVYT0xIMGpvb2xVCjZnZjEzSDM5QWdNQkFBRUNnZ0VBQXlsZWthS2hYRWRzbWt5WU9hTFZmSm56Z0QyeGd4L0hyNnpyUERkUE1UMlkKNXFRazc3SjVtSUViWW51b2lqTlhXcmxSQUkvRGdzR3ZRTEg5N04yWDJWQTVYbEVqN2Z0RnV6ekZsUnA0VklNSwpJNjBHNjM1cVlNemNZeU5vNlNkWWw5TkFlMjFUMGlCSzFheGJLZzBQYThNOHgyWUI3K1plYVdpV0Rra1hiOXpICitTMmZneEtpWWZQclV2MXB3WnhLL3JZV1pCL2Q5L0xTQUtveWQrQmNqQ1B2RnYwbXZiY0k4ZG1UTE5hYU1RNHoKUlBqV2tvOWpWRmhGYUdCOWZMVEFNVE9Db0NTQzlrLzFWQkVwMm5WUjBPQnAzbU9scDJGVDN4KzVza2RNbi9yQgpZUWRJelo3Z1RKaGxXbFVpRGsxWXB2M0tPUVlYaW40YTNYTHhuVjNXRVFLQmdRRDhOeUNqWW9SWXpSeTQwUTZ3Cm1TVmlkSWM5SWpQV0VUam1ia1R5MjNJL0kxVWpHUkxqNktjNzBVaTJVSFpLWGpaQktGQnhyb1Y0ckxnSW13NGYKeGNnbDFiWUZNWW14RFpFZmdUOElmMGJZelZ4Vmh5WXgrS1VTOHdkWmtOQWd6VjhhZmJMKysvRzdqd0N6eisyNQpqSk5rWlBTTVJ1b0gxMlpQWWc2d05lNmlqUUtCZ1FEWlcxN2ZJcHdTSFBDL0k5bzlETlhOekZFOUo2OUZ2b1RiCmJQMXZrQk9FclZScGQ5QkdJTGd6K3RsQ3hYQTZRcjBwRTBaT0ZYQnQyZHRpWm9UY2Zma25VWFJHd3FPUjF1c3EKSmtLUlNNVHlzTFhQVWJ6Zmd5ZHJyTEsvUjhEWW01aURLTm9OYlVydVlJM1Y5WHA5bEpsVkRXV1hlQ082WldYSAowRXE4R0xVbE1RS0JnUUN4ZDVETnBpcDkyWVdXUGZQYUswaDA2STJvWklLWTQvRm5vcnQ5THhCS2dQQU5ERDJRCmhFbjMreUR3dDlra0p2cUNDbjNnSCs3bXBKR3g3SGladnE5QWdBbmR5YWViSDNLMytsZUNBUnkydkhsMTdPemgKU0pYT3FaYklYTzgxeFl4ZnRZYlhpQ3ZsejQrczltZk5vYTZzZTZUZmQ1NkErZjJSYWV2djdXTUdtUUtCZ1FETwpVQk5pVzVpbS9MOXJ2dDFGTzZ5cDFubDZRZlAxa0p6TkpzdjlIRlhhaHlmcm9HV2FXeTVkY0lyTy9WZkVoVnJGCjVWekRlMGdualRYWFZoWmdzRlpTQXRnSzNtK2lXODBHU2lDL2hNSWsxcVVNYjdxR3NoZzE5VXdKa2xNemg2V2gKUWFLUVFpQncya2RuUXNZTTg0TURuMTdDQXJCdkdoWWRMdEh4YnNacTBRS0JnSFZIUlJKY2RKSVVsSU9uaWZhNQpYS1FyZUNLa3VkWEtLY2dmaGt5UllrVVIrcFp1ZFA4SXZSSEFiVmRQQjU1emFNUHZyUlBmY1VGcnQyQk9RMDdNCmVnUHNLVnVremdkVUVSVU5MUEszYzEyK1FLQ0IwaTRkaWFPRUVzMDRoTGRNWVFYdW9waUZwT0VxMlRiRk1BRHgKRHVFbUpzaUxjSkZVOEVYMytLOXlxRnVhCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K'

const enforcementJwt = () => {
  const privateKey = Buffer.from(enforcementPrivate, 'base64').toString()

  const options = {
    expiresIn: '1h',
    algorithm: 'RS256',
    audience: 'aphw-ddi-api',
    issuer: 'aphw-ddi-enforcement',
    keyid: 'aphw-ddi-enforcement'
  }

  const token = jwt.sign({
    username: 'enforcement.user@example.com',
    displayname: 'enforcement.user@example.com',
    scope: ['Dog.Index.Enforcement'],
    token: 'ZGV2LXVzZXJAdGVzdC5jb206QUJDREVGRzEyMzQ1Ng=='
  }, privateKey, options)

  return {
    headers: {
      'ddi-username': 'enforcement.user@example.com',
      'ddi-displayname': 'enforcement.user@example.com',
      'enforcement-user-agent': 'Mozilla/5.0',
      Authorization: `Bearer ${token}`
    }
  }
}

const portalJwt = () => {
  const privateKey = Buffer.from(portalPrivate, 'base64').toString()

  const options = {
    expiresIn: '1h',
    algorithm: 'RS256',
    audience: 'aphw-ddi-api',
    issuer: 'aphw-ddi-portal',
    keyid: 'aphw-ddi-portal'
  }

  const token = jwt.sign({
    username: 'dev-user@test.com',
    displayname: 'dev-user@test.com',
    scope: ['Dog.Index.Admin']
  }, privateKey, options)

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

const apiJwt = () => {
  const privateKey = Buffer.from(apiPrivate, 'base64').toString()

  const options = {
    expiresIn: '1h',
    algorithm: 'RS256',
    audience: 'aphw-ddi-api',
    issuer: 'aphw-ddi-api',
    keyid: 'aphw-ddi-api'
  }

  const token = jwt.sign({
    username: 'overnight-job-system-user',
    displayname: 'Overnight Job System User',
    scope: ['Dog.Index.Admin']
  }, privateKey, options)

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

const portalJwtStandard = () => {
  const privateKey = Buffer.from(portalPrivate, 'base64').toString()

  const options = {
    expiresIn: '1h',
    algorithm: 'RS256',
    audience: 'aphw-ddi-api',
    issuer: 'aphw-ddi-portal',
    keyid: 'aphw-ddi-portal'
  }

  const token = jwt.sign({
    username: 'standard-user@test.com',
    displayname: 'standard-user@test.com',
    scope: ['Dog.Index.Standard']
  }, privateKey, options)

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

module.exports = {
  apiHeader: apiJwt(),
  enforcementHeader: enforcementJwt(),
  portalHeader: portalJwt(),
  portalStandardHeader: portalJwtStandard()
}
