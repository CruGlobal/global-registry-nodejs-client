
const { GRClient } = require('./index')
const client = require('./lib/client')

describe('check a proper delegation', () => {
  test('GRClient is properly delegated', () => {
    expect(GRClient).toEqual(client.GRClient)
  })
})
