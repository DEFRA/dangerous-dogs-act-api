const { buildAddressString, buildAddressStringAlternate, preparePostalNameAndAddress } = require('../../../../app/lib/address-helper')

describe('AddressHelper test', () => {
  describe('buildAddressString test', () => {
    test('should build address', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })).toEqual('addr1, addr2, town, postcode')
    })
    test('should build short address', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: null,
        town: null,
        postcode: 'postcode'
      })).toEqual('addr1, postcode')
    })
    test('should build address and add alternate postcode', () => {
      expect(buildAddressString({
        address_line_1: 'addr1',
        address_line_2: 'addr2',
        town: 'town',
        postcode: 'post code'
      }, true)).toEqual('addr1, addr2, town, post code, postcode')
    })
  })

  describe('buildAddressStringAlternate test', () => {
    test('should build address', () => {
      expect(buildAddressStringAlternate({
        addressLine1: 'addr1',
        addressLine2: 'addr2',
        town: 'town',
        postcode: 'postcode'
      })).toEqual('addr1, addr2, town, postcode')
    })
    test('should build short address', () => {
      expect(buildAddressStringAlternate({
        addressLine1: 'addr1',
        addressLine2: null,
        town: null,
        postcode: 'postcode'
      })).toEqual('addr1, postcode')
    })
  })

  describe('preparePostalNameAndAddress test', () => {
    test('should build address with all parts', () => {
      expect(preparePostalNameAndAddress({
        firstName: 'John',
        lastName: 'Smith',
        contactDetails: {
          addressLine1: 'addr1',
          addressLine2: 'addr2',
          town: 'town',
          postcode: 'postcode'
        }
      })).toEqual('John Smith\naddr1\naddr2\ntown\npostcode')
    })
    test('should build name even if only first name', () => {
      expect(preparePostalNameAndAddress({
        firstName: 'John',
        contactDetails: {
          addressLine1: 'addr1',
          addressLine2: 'addr2',
          town: 'town',
          postcode: 'postcode'
        }
      })).toEqual('John\naddr1\naddr2\ntown\npostcode')
    })
    test('should build name even if only last name', () => {
      expect(preparePostalNameAndAddress({
        lastName: 'Smith',
        contactDetails: {
          addressLine1: 'addr1',
          addressLine2: 'addr2',
          town: 'town',
          postcode: 'postcode'
        }
      })).toEqual('Smith\naddr1\naddr2\ntown\npostcode')
    })
    test('should build address when missing 1 line', () => {
      expect(preparePostalNameAndAddress({
        firstName: 'John',
        lastName: 'Smith',
        contactDetails: {
          addressLine1: 'addr1',
          town: 'town',
          postcode: 'postcode'
        }
      })).toEqual('John Smith\naddr1\ntown\npostcode')
    })
    test('should build address when missing 2 lines', () => {
      expect(preparePostalNameAndAddress({
        firstName: 'John',
        lastName: 'Smith',
        contactDetails: {
          addressLine1: 'addr1',
          postcode: 'postcode'
        }
      })).toEqual('John Smith\naddr1\npostcode')
    })
  })
})
