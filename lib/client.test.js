const uuid = require('uuid')
const nock = require('nock')
const { GRClient } = require('./client')

const BASE_URL = 'http://localhost/'

function headers (token) {
  return {
    'authorization': 'Bearer ' + token,
    'accept': 'application/json',
    'host': 'localhost',
    'accept-encoding': 'gzip, deflate'
  }
}

describe('GRClient', () => {
  test('Entity - GET', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }

    const name = uuid.v4()

    const expectedResult = { entities: [{
      name: name,
      type: 'person'
    }] }

    nock(BASE_URL, { reqheaders: headers(token) })
      .get('/entities/?filter%5Bname%5D=' + name)
      .reply(200, expectedResult)

    const grClient = new GRClient(options)

    return grClient.Entity.get({ filter: { name: name } })
      .then(result => {
        expect(result).toEqual(expectedResult)
      })
  })

  test('Entity - GET one', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }

    const id = uuid.v4()

    const expectedResult = {
      entity: {
        person: {
          name: uuid.v4()
        }
      }
    }

    nock(BASE_URL, { reqheaders: headers(token) })
      .get(`/entities/${id}`)
      .reply(200, expectedResult)

    const grClient = new GRClient(options)

    return grClient.Entity.getOne(id)
      .then(result => {
        expect(result).toEqual(expectedResult)
      })
  })

  test('Entity - POST', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }
    const name = uuid.v4()

    const entity = {
      name: name,
      type: 'person'
    }

    const scope = nock(BASE_URL, { reqheaders: headers(token) })
      .post('/entities/')
      .reply(200, '{}')

    const grClient = new GRClient(options)

    return grClient.Entity.post(entity)
      .then(() => {
        scope.done()
      })
  })

  test('Entity - PUT', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }
    const name = uuid.v4()

    const entity = {
      name: name,
      type: 'person'
    }

    const scope = nock(BASE_URL, { reqheaders: headers(token) })
      .put('/entities/1234')
      .reply(200, '{}')

    const grClient = new GRClient(options)

    return grClient.Entity.put(1234, entity)
      .then(() => {
        scope.done()
      })
  })

  test('Entity - DELETE', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }

    const scope = nock(BASE_URL, { reqheaders: headers(token) })
      .delete('/entities/1234')
      .reply(200, '{}')

    const grClient = new GRClient(options)

    return grClient.Entity.delete(1234)
      .then(() => {
        scope.done()
      })
  })

  test('EntityType - PUT', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }
    const name = uuid.v4()

    const entity = {
      name: name,
      type: 'person'
    }

    const scope = nock(BASE_URL, { reqheaders: headers(token) })
      .put('/entity_types/1234')
      .reply(200, '{}')

    const grClient = new GRClient(options)

    return grClient.EntityType.put(1234, entity)
      .then(result => {
        scope.done()
      })
  })

  test('Entity - PUT with full_response', () => {
    const token = uuid.v4()
    const options = { baseUrl: BASE_URL, accessToken: token }
    const name = uuid.v4()

    const entity = {
      name: name,
      type: 'person'
    }

    const scope = nock(BASE_URL, { reqheaders: headers(token) })
      .put('/entities/1234?full_response=true')
      .reply(200, '{}')

    const grClient = new GRClient(options)

    return grClient.Entity.put(1234, entity, { full_response: true })
      .then(() => {
        scope.done()
      })
  })
})
