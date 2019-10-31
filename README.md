# Global Registry Client for Node.js

The library contains the implementation of the Global Registry API Client

## Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:CruGlobal/global-registry-nodejs-client.git
cd global-registry-nodejs-client
npm install
```

## Usage

Determine configuration parameters:

##### baseUrl

Base URL is the URL address of the Global Registry endpoint.

You can provide the address in the client options as `baseUrl`or through environment variable `GLOBAL_REGISTRY_URL`.
 
##### accessToken


You can provide the access token in the client options as `accessToken` or through environment variable `GLOBAL_REGISTRY_TOKEN`

### Initialize the client object

```javascript
const { GRClient } = require('global-registry-nodejs-client')
const options = {baseUrl: ' ... ', accessToken: ' ... '}
const client = new GRClient(options)
```

### Call API

Now you can use specific objects of the client, to access Global Registry resources.

For example, to access EntityType resources:
 
```javascript
// GET records
client.EntityType.get( {filters: {name: 'person'}} ).then( result => result.entities.map(e => e.entity_type) )

// GET one record, by ID
client.EntityType.getOne('1200beca-169c-4443-85b3-80611f5c25a5').then( result => result.entity.entity_type )

// POST:
client.EntityType.post({name: '', parent_id: ''}, {full_response: true}).then()

// PUT:
client.EntityType.put(123, {name: '', parent_id: ''}).then()
// or
client.EntityType.put(123, {name: '', parent_id: ''}, {full_response: true}).then()

// DELETE
client.EntityType.delete(123).then()
``` 
Mind, that the input data for `POST` and `PUT` does not contain wrapping entity type!

So it looks like 
```json
  {
    "name": "xx",
    "parent_id": 123
  }
```

not:
```json
{ "entity_type": 
  {
    "name": "xx",
    "parent_id": 123
  }
} 
```
however, for now, results _are_ wrapped in pluralized object name, for example:
```json
{ "entity_types": [
  {
    "name": "xx",
    "parent_id": 123
  }
]} 
```

### Supported Global Registry resources:

- Entity
- EntityType
- RelationshipType
- EnumValue
- Measurement
- MeasurementType
- System

## Running Tests

```bash
npm test
```
