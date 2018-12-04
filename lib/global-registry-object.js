
const { translateNestedParameters } = require('./http-client')

class GlobalRegistryReadOnlyObject {
  constructor (httpClient, options) {
    this.httpClient = httpClient
    this.path = `/${options.path}/`.replace(/[/]+/g, '/')
    this.name = options.name
  }

  get (params) {
    return this.httpClient.get(this.path, translateNestedParameters(params))
  }

  getOne (id, params) {
    return this.httpClient.get(this._pathWithId(id), translateNestedParameters(params || {}))
  }

  _pathWithId (id) {
    return `${this.path}${id}`
  }
}

class GlobalRegistryReadAndDeleteObject extends GlobalRegistryReadOnlyObject {
  delete (id) {
    return this.httpClient.delete(this._pathWithId(id))
  }
}

class GlobalRegistryObject extends GlobalRegistryReadAndDeleteObject {
  post (content) {
    return this.httpClient.post(this.path, this._buildBody(content))
  }

  put (id, content, options) {
    return this.httpClient.put(this._pathWithId(id), this._buildBody(content), options || {})
  }

  _buildBody (content) {
    const body = {}
    body[this.name] = content
    return body
  }
}

class GlobalRegistrySubscriptionObject extends GlobalRegistryReadAndDeleteObject {
  constructor (httpClient) {
    super(httpClient, { path: '/subscriptions/', name: 'Subscription' })
  }

  subscribe (entityTypeId, endpoint, format = 'json') {
    const payload = {
      subscription: {
        entity_type_id: entityTypeId,
        endpoint: endpoint,
        format: format
      }
    }
    return this.httpClient.post(this.path, payload)
  }

  confirm (endpoint) {
    return this.httpClient.get(endpoint)
  }
}

module.exports = {
  GlobalRegistryReadOnlyObject,
  GlobalRegistryReadAndDeleteObject,
  GlobalRegistryObject,
  GlobalRegistrySubscriptionObject
}
