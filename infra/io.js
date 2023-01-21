const { Server } = require('socket.io')

module.exports = ({ server, config }) => {
  return new Server(server)
}
