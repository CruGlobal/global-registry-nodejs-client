
const rewire = require('rewire')
const nock = require('nock')
const _ = require('lodash')
const uuid = require('uuid')

const { HttpClient, translateNestedParameters } = rewire('./http-client')

const BASE_DOMAIN = 'http://localhost'

function headers (token) {
  return {
    'authorization': 'Bearer ' + token,
    'accept': 'application/json',
    'host': 'localhost',
    'accept-encoding': 'gzip, deflate'
  }
}

describe('HttpClient', () => {
  test('does GET calls', () => {
    nock(BASE_DOMAIN, { reqheaders: headers('fake') })
      .get('/something/?param1=123&param2=456')
      .reply(200, '{"result": "gotha"}')

    const tested = new HttpClient({ baseUrl: BASE_DOMAIN, accessToken: 'fake' })

    return tested.get('/something/', { param1: 123, param2: 456 })
      .then(result => {
        expect(result).toEqual({ result: 'gotha' })
      })
  })

  test('does POST calls', () => {
    nock(BASE_DOMAIN, { reqheaders: headers('fake') })
      .post('/something/', _.matches({ some: 'value' }))
      .reply(200, '{"result": "gotha"}')

    const tested = new HttpClient({ baseUrl: BASE_DOMAIN, accessToken: 'fake' })

    return tested.post('/something/', { some: 'value' })
      .then(result => {
        expect(result).toEqual({ result: 'gotha' })
      })
  })

  test('does POST calls with query params', () => {
    nock(BASE_DOMAIN, { reqheaders: headers('fake') })
      .post('/something/?require_mdm=true', _.matches({ some: 'value' }))
      .reply(200, '{"result": "gotha"}')

    const tested = new HttpClient({ baseUrl: BASE_DOMAIN, accessToken: 'fake' })

    return tested.post('/something/', { some: 'value' }, { require_mdm: true })
      .then(result => {
        expect(result).toEqual({ result: 'gotha' })
      })
  })

  test('does PUT calls', () => {
    const id = uuid.v4()
    nock(BASE_DOMAIN, { reqheaders: headers('fake') })
      .put('/something/' + id, _.matches({ some: 'value' }))
      .reply(200, '{"result": "gotha"}')

    const tested = new HttpClient({ baseUrl: BASE_DOMAIN, accessToken: 'fake' })

    return tested.put('/something/' + id, { some: 'value' })
      .then(result => {
        expect(result).toEqual({ result: 'gotha' })
      })
  })

  test('does DELETE calls', () => {
    const id = uuid.v4()
    nock(BASE_DOMAIN, { reqheaders: headers('fake') })
      .delete('/something/' + id)
      .reply(200, '{"result": "gotha"}')

    const tested = new HttpClient({ baseUrl: BASE_DOMAIN, accessToken: 'fake' })

    return tested.delete('/something/' + id)
      .then(result => {
        expect(result).toEqual({ result: 'gotha' })
      })
  })
})

describe('translateNestedParameters', () => {
  test('simple case', () => {
    const params = { key: 'value', num: 123 }

    const result = translateNestedParameters(params)
    expect(result).toEqual(params)
  })

  test('string case', () => {
    const params = 'key=value&num=12345'

    const result = translateNestedParameters(params)
    expect(result).toEqual(params)
  })

  test('array case', () => {
    const params = { a: [1, 2, 3], b: 56 }

    const result = translateNestedParameters(params)
    expect(result).toEqual({ 'a[0]': 1, 'a[1]': 2, 'a[2]': 3, 'b': 56 })
  })

  test('nested case', () => {
    const params = { filters: { name: 'test', parentId: 123 }, something: 'else' }

    const result = translateNestedParameters(params)
    expect(result).toEqual({ 'filters[name]': 'test', 'filters[parentId]': 123, 'something': 'else' })
  })

  test('very nested case', () => {
    const params = { filters: { name: { first: 'John', last: 'Smith' }, parentId: 123 }, something: 'else' }

    const result = translateNestedParameters(params)
    expect(result).toEqual({ 'filters[name][first]': 'John', 'filters[name][last]': 'Smith', 'filters[parentId]': 123, 'something': 'else' })
  })
})
