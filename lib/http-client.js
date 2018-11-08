const _ = require('lodash')
const request = require('request-promise-native')

function mapToParams (result, prefix, params) {
  return _.map(params, (value, key) => {
    const entryKey = prefix ? `${prefix}[${key}]` : key
    if (typeof value === 'object') {
      mapToParams(result, entryKey, value)
    } else {
      result[entryKey] = value
    }
  })
}

function translateNestedParameters (parameters) {
  if (typeof parameters === 'string') {
    return parameters
  } else if (typeof parameters === 'object') {
    const result = {}
    mapToParams(result, null, parameters)
    return result
  }
}

class HttpClient {
  constructor (options) {
    this.options = options
    this.request = request.defaults(this.getRequestDefaults())
  }

  getRequestDefaults () {
    return {
      baseUrl: this.options.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.options.accessToken}`
      },
      json: true,
      timeout: 30000,
      gzip: true
    }
  }

  get (path, params) {
    return this.request.get(path, { qs: params })
  }

  post (path, content) {
    return this.request.post(path, { body: content })
  }

  put (path, content, parameters) {
    return this.request.put(path, { body: content, qs: parameters || {} })
  }

  delete (path) {
    return this.request.delete(path)
  }
}

module.exports = {
  HttpClient,
  translateNestedParameters
}
