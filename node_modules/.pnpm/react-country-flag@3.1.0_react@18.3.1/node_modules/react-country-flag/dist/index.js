
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-country-flag.cjs.production.min.js')
} else {
  module.exports = require('./react-country-flag.cjs.development.js')
}
