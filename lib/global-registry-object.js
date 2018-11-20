
const { translateNestedParameters } = require('./http-client')

class GlobalRegistryObject {
  constructor (httpClient, options) {
    this.httpClient = httpClient
    this.path = `/${options.path}/`.replace(/[/]+/g, '/')
    this.name = options.name
  }

  post (content) {
    return this.httpClient.post(this.path, this._buildBody(content))
  }

  put (id, content, options) {
    return this.httpClient.put(this._pathWithId(id), this._buildBody(content), options || {})
  }

  delete (id) {
    return this.httpClient.delete(this._pathWithId(id))
  }

  get (params) {
    return this.httpClient.get(this.path, translateNestedParameters(params))
  }

  getOne (id) {
    return this.httpClient.get(this._pathWithId(id))
  }

  _pathWithId (id) {
    return `${this.path}${id}`
  }

  _buildBody (content) {
    const body = {}
    body[this.name] = content
    return body
  }
}

module.exports = {
  GlobalRegistryObject
}
