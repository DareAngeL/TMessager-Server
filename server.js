const express = require('express')
const http = require('http')
const app = express()

const server = http.createServer(app)

app.get('/', (req, res) => {
  res.send('Server is running...')
  res.end()
})

const PORT = process.env.PORT || 1997
server.listen(PORT, () => {
  console.log('Listening on port 1997')
})