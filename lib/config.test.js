const uuid = require('uuid')

const { Configurator } = require('./config')

describe('Configurator', () => {
  test('constructor with given parameters', () => {
    const options = { baseUrl: `http://${uuid.v4()}.localhost`, accessToken: uuid.v4() }
    const tested = new Configurator(options)

    expect(tested.baseUrl).toEqual(options.baseUrl)
    expect(tested.accessToken).toEqual(options.accessToken)
  })

  test('constructor with default value', () => {
    const options = { accessToken: uuid.v4() }
    const tested = new Configurator(options)

    expect(tested.baseUrl).toEqual('https://backend.global-registry.org')
    expect(tested.accessToken).toEqual(options.accessToken)
  })

  describe('with environment variables', () => {
    beforeEach(() => {
      process.env.GLOBAL_REGISTRY_URL = `http://${uuid.v4()}.localhost`
      process.env.GLOBAL_REGISTRY_TOKEN = uuid.v4()
    })

    afterEach(() => {
      delete process.env.GLOBAL_REGISTRY_URL
      delete process.env.GLOBAL_REGISTRY_TOKEN
    })

    test('constructor with default value', () => {
      const tested = new Configurator()

      expect(tested.baseUrl).toEqual(process.env.GLOBAL_REGISTRY_URL)
      expect(tested.accessToken).toEqual(process.env.GLOBAL_REGISTRY_TOKEN)
    })
  })
})
