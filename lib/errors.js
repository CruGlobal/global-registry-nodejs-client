
class ConfigurationError extends Error {}

class MissingParameterError extends ConfigurationError {}

module.exports = {
  ConfigurationError,
  MissingParameterError
}
