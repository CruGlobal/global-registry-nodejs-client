const rewire = require('rewire')
const uuid = require('uuid')

const {
  GlobalRegistryReadOnlyObject,
  GlobalRegistryReadAndDeleteObject,
  GlobalRegistryObject,
  GlobalRegistrySubscriptionObject } = rewire('./global-registry-object')

describe('GlobalRegistryReadOnlyObject', () => {
  test('constructor', () => {
    const mockHttpClient = uuid.v4()
    const mockName = uuid.v4()

    const result = new GlobalRegistryReadOnlyObject(mockHttpClient, { path: '/test/', name: mockName })

    expect(result.httpClient).toEqual(mockHttpClient)
    expect(result.path).toEqual('/test/')
    expect(result.name).toEqual(mockName)
  })

  test('constructor normalizes path', () => {
    const mockHttpClient = uuid.v4()
    const mockName = uuid.v4()

    const result = new GlobalRegistryReadOnlyObject(mockHttpClient, { path: 'otherTest', name: mockName })

    expect(result.httpClient).toEqual(mockHttpClient)
    expect(result.path).toEqual('/otherTest/')
    expect(result.name).toEqual(mockName)
  })

  test('act as EntityType - get', () => {
    const mockHttpClient = { get: jest.fn() }

    const tested = new GlobalRegistryReadOnlyObject(mockHttpClient, { path: '/entity_types/', name: 'entity_type' })

    tested.get({ filter: { name: 'organization' } })
    expect(mockHttpClient.get.mock.calls.length).toBe(1)
    expect(mockHttpClient.get.mock.calls[0]).toEqual(['/entity_types/', { 'filter[name]': 'organization' }])
  })

  test('act as Entity - getOne', () => {
    const mockHttpClient = { get: jest.fn() }

    const id = uuid.v4()
    const tested = new GlobalRegistryReadOnlyObject(mockHttpClient, { path: '/entities/', name: 'entity' })

    tested.getOne(id)
    expect(mockHttpClient.get.mock.calls.length).toBe(1)
    expect(mockHttpClient.get.mock.calls[0]).toEqual(['/entities/' + id, {}])
  })
})

describe('GlobalRegistryReadAndDeleteObject', () => {
  test('act as EntityType - delete', () => {
    const mockHttpClient = { delete: jest.fn() }

    const tested = new GlobalRegistryReadAndDeleteObject(mockHttpClient, { path: '/entity_types/', name: 'entity_type' })

    tested.delete(12345)
    expect(mockHttpClient.delete.mock.calls.length).toBe(1)
    expect(mockHttpClient.delete.mock.calls[0]).toEqual(['/entity_types/12345'])
  })
})

describe('GlobalRegistryObject', () => {
  test('act as EntityType - post', () => {
    const mockHttpClient = { post: jest.fn() }

    const tested = new GlobalRegistryObject(mockHttpClient, { path: '/entity_types/', name: 'entity_type' })

    tested.post({ name: 'somename' })
    expect(mockHttpClient.post.mock.calls.length).toBe(1)
    expect(mockHttpClient.post.mock.calls[0]).toEqual(['/entity_types/', { entity_type: { name: 'somename' } }])
  })

  test('act as EntityType - put', () => {
    const mockHttpClient = { put: jest.fn() }

    const tested = new GlobalRegistryObject(mockHttpClient, { path: '/entity_types/', name: 'entity_type' })

    tested.put(1234, { name: 'somename' })
    expect(mockHttpClient.put.mock.calls.length).toBe(1)
    expect(mockHttpClient.put.mock.calls[0]).toEqual(['/entity_types/1234', { entity_type: { name: 'somename' } }, {}])
  })
})

describe('GlobalRegistrySubscriptionObject', () => {
  test('act as EntityType - subscribe', () => {
    const mockHttpClient = { post: jest.fn() }

    const tested = new GlobalRegistrySubscriptionObject(mockHttpClient)
    const endpoint = `http://${uuid.v4()}.localhost/`
    const expectedParams = {
      subscription: {
        endpoint: endpoint,
        entity_type_id: 'person',
        format: 'json'
      }
    }
    tested.subscribe('person', endpoint)
    expect(mockHttpClient.post.mock.calls.length).toBe(1)
    expect(mockHttpClient.post.mock.calls[0]).toEqual(['/subscriptions/', expectedParams])
  })
})
