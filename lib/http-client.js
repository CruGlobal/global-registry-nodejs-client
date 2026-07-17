const http = require('http')
const https = require('https')
const zlib = require('zlib')
const querystring = require('querystring')
const { URL } = require('url')

const DEFAULT_TIMEOUT = 30000

/**
 * Mirrors request-promise-native's RequestError shape (name/message/error/
 * options) so existing consumers that inspect thrown errors keep working
 * unmodified (e.g. network failures, timeouts).
 */
class RequestError extends Error {
  constructor (cause, options) {
    super(String(cause))
    this.name = 'RequestError'
    this.cause = cause
    this.error = cause // legacy attribute, mirrors request-promise-native
    this.options = options
  }
}

/**
 * Mirrors request-promise-native's StatusCodeError shape (name/statusCode/
 * message/error/options/response) so existing consumers that inspect
 * thrown errors (e.g. err.statusCode, err.error) keep working unmodified.
 */
class StatusCodeError extends Error {
  constructor (statusCode, body, options, response) {
    super(`${statusCode} - ${JSON.stringify(body)}`)
    this.name = 'StatusCodeError'
    this.statusCode = statusCode
    this.error = body // legacy attribute, mirrors request-promise-native
    this.options = options
    this.response = response
  }
}

function mapToParams (result, prefix, params) {
  return Object.keys(params).map((key) => {
    const value = params[key]
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

function buildQueryString (qs) {
  if (qs === undefined || qs === null || qs === '') {
    return ''
  }
  if (typeof qs === 'string') {
    return qs
  }
  const flat = {}
  Object.keys(qs).forEach((key) => {
    if (qs[key] !== undefined) {
      flat[key] = qs[key]
    }
  })
  return querystring.stringify(flat)
}

/**
 * Minimal promise-based HTTP client built directly on Node's core `http`/
 * `https` modules (JSON in, JSON out, optional gzip/deflate response
 * decoding). Replaces request-promise-native/request, which pull in the
 * vulnerable, unpatchable form-data@2.3.3 and are both deprecated.
 *
 * Deliberately avoids the global `fetch`/`URL`/`AbortController` APIs
 * (using `require('url').URL` explicitly instead of the ambient global) -
 * this repo's Jest 22 test environment runs code in a `vm.createContext`
 * sandbox that does not expose those globals, so relying on them breaks
 * the existing nock-based test suite.
 */
class HttpClient {
  constructor (options) {
    this.options = options
  }

  _headers (hasBody) {
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.options.accessToken}`,
      'Accept-Encoding': 'gzip, deflate'
    }
    if (hasBody) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  _resolveUrl (path, qs) {
    const url = new URL(path, this.options.baseUrl)
    const search = buildQueryString(qs)
    if (search) {
      const existing = url.search ? url.search.slice(1) : ''
      url.search = existing ? `${existing}&${search}` : search
    }
    return url
  }

  _request (method, path, { qs, body } = {}) {
    const requestOptions = { method, path, qs }

    return new Promise((resolve, reject) => {
      let url
      try {
        url = this._resolveUrl(path, qs)
      } catch (cause) {
        reject(new RequestError(cause, requestOptions))
        return
      }

      const hasBody = body !== undefined
      const payload = hasBody ? JSON.stringify(body) : undefined
      const headers = this._headers(hasBody)
      if (payload !== undefined) {
        headers['Content-Length'] = Buffer.byteLength(payload)
      }

      const transport = url.protocol === 'https:' ? https : http

      const req = transport.request({
        method: method.toUpperCase(),
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers,
        timeout: DEFAULT_TIMEOUT
      }, (res) => {
        const encoding = (res.headers['content-encoding'] || '').toLowerCase()
        let stream = res
        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip())
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate())
        }

        const chunks = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('error', (cause) => reject(new RequestError(cause, requestOptions)))
        stream.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          let parsedBody = text
          if (text) {
            try {
              parsedBody = JSON.parse(text)
            } catch (parseError) {
              parsedBody = text
            }
          }

          const statusCode = res.statusCode
          if (statusCode < 200 || statusCode >= 300) {
            reject(new StatusCodeError(statusCode, parsedBody, requestOptions, res))
          } else {
            resolve(parsedBody)
          }
        })
      })

      req.on('timeout', () => {
        req.destroy(new Error(`Request timed out after ${DEFAULT_TIMEOUT}ms`))
      })
      req.on('error', (cause) => reject(new RequestError(cause, requestOptions)))

      if (payload !== undefined) {
        req.write(payload)
      }
      req.end()
    })
  }

  get (path, params) {
    return this._request('get', path, { qs: params })
  }

  post (path, content, parameters) {
    return this._request('post', path, { qs: parameters || {}, body: content })
  }

  put (path, content, parameters) {
    return this._request('put', path, { qs: parameters || {}, body: content })
  }

  delete (path) {
    return this._request('delete', path)
  }
}

module.exports = {
  HttpClient,
  translateNestedParameters,
  RequestError,
  StatusCodeError
}
