
const { Configurator } = require('./config')
const { HttpClient } = require('./http-client')
const {
  GlobalRegistryObject,
  GlobalRegistrySubscriptionObject,
  GlobalRegistryReadOnlyObject } = require('./global-registry-object')

const grTypes = [
  {
    type: 'Entity',
    path: '/entities/',
    name: 'entity' },
  {
    type: 'EntityType',
    path: '/entity_types/',
    name: 'entity_type' },
  {
    type: 'RelationshipType',
    path: '/relationship_types/',
    name: 'relationship_type' },
  {
    type: 'EnumValue',
    path: '/enum_values/',
    name: 'enum_value' },
  {
    type: 'Measurement',
    path: '/measurements/',
    name: 'measurement' },
  {
    type: 'System',
    path: '/systems/',
    name: 'system' }
]

const grReadOnlyTypes = [
  {
    type: 'MeasurementType',
    path: '/measurement_types/',
    name: 'measurement_type' }
]

/**
 * Global Registry API Client.
 *
 * The Client contains specialized objects,
 * like Entity or EntityType which refer to a given object type in Global Registry.
 *
 * Example:
 * In order to get EntityType, filtered by name 'person':
 *
 * client = new GRClient(options)
 * client.EntityType.get( {filters: {name: 'person'}} ).then( ... )
 *
 * Constructor parameter options, should may contain:
 * - baseUrl - the Global Registry URL. When not provided, the client looks at env.GLOBAL_REGISTRY_URL
 * - accessToken - the access token, when not provided, the client looks at env.GLOBAL_REGISTRY_TOKEN
 *
 * @class
 */
class GRClient {
  constructor (options) {
    this.options = new Configurator(options)
    this.rawHttpClient = new HttpClient(this.options)

    grTypes.map(typeDef => {
      this[typeDef.type] = new GlobalRegistryObject(this.rawHttpClient, typeDef)
    })
    grReadOnlyTypes.map(typeDef => {
      this[typeDef.type] = new GlobalRegistryReadOnlyObject(this.rawHttpClient, typeDef)
    })

    this.Subscription = new GlobalRegistrySubscriptionObject(this.rawHttpClient)
  }
}

module.exports = {
  GRClient
}
