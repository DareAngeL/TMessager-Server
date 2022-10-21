const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require("socket.io")

const socketIO = new Server(server)

app.get('/', (req, res) => {
  res.send('Server is running...')
})

socketIO.on('connection', (socket) => {
  console.log('new user connected');
})

const PORT = process.env.PORT || 2022
server.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})