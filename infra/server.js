const http = require('http')

module.exports = ({ express }) => {
  return http.createServer(express)
}
