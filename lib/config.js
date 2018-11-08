const { MissingParameterError } = require('./errors')

const defaultOptions = {
  baseUrl: 'https://backend.global-registry.org',
  accessToken: null
}

function _valueExists (value) {
  return typeof value === 'string' && value.length > 0
}

class Configurator {
  constructor (options) {
    const builder = this.optionBuilder(options || {})

    builder('baseUrl', 'GLOBAL_REGISTRY_URL')
    builder('accessToken', 'GLOBAL_REGISTRY_TOKEN')
  }

  optionBuilder (options) {
    return (name, envName) => {
      const value = options[name] || process.env[envName] || defaultOptions[name]
      if (_valueExists(value)) {
        this[name] = value
      } else {
        throw new MissingParameterError(`Missing configuration option: ${name} and environment variable ${envName}`)
      }
    }
  }
}

module.exports = {
  Configurator
}
