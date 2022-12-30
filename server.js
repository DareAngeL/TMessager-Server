// version 1.0
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require("socket.io")

const socketIO = new Server(server)

app.get('/', (req, res) => {
  res.send('Server is running...')
})

let connected = 0
// KEYS: MESSAGE, POS
let unseenMsgs = {
  BABE_RENE: [{}],
  BABE_EZIEL: [{}],
}

unseenMsgs.BABE_RENE.pop()
unseenMsgs.BABE_EZIEL.pop()

socketIO.on('connection', (socket) => {
  connected++

  const Events = {
    ENTER_ROOM: 'enter-chatroom',
    OFFLINE: 'offline',
    SEND_MSG: 'send_msg',
    SENT: 'msg_sent',
    
    NEW_MSG: 'new-msg',
    RECEIVE: 'rcv',
    CHATMATE_JOINED: 'chat-mate-joined',
    DEL_UNSEEN: 'delete_unseen_msgs'

  }

  const Users = {
    RENE: 'Babe Rene',
    EZIEL: 'Babe Eziel'
  }

  const Status = {
    SENT: 'Sent',
    SEEN: 'Seen'
  }

  socket.on(Events.ENTER_ROOM, (user, room) => {
    // when entered, always check if there are any unseen messages
    const msgsMap = {
      Rene: unseenMsgs.BABE_RENE,
      Eziel: unseenMsgs.BABE_EZIEL
    }

    const msgJson = JSON.stringify(msgsMap)

    socket.join(room)
    socket.emit(Events.ENTER_ROOM, msgJson)
    socket.broadcast.to(room).emit(Events.CHATMATE_JOINED, "")
  })

  socket.on(Events.CHATMATE_JOINED, (room, from) => {
    socket.broadcast.to(room).emit(Events.CHATMATE_JOINED, from)
  })

  socket.on(Events.SEND_MSG, (room, user, msg, position, status) => {
    const _msg = {
      MSG: msg,
      POS: position,
      STAT: status
    }

    // emit to the receiver
    socket.broadcast.to(room).emit(Events.NEW_MSG, JSON.stringify(_msg))

    if (user === Users.RENE) {
      unseenMsgs.BABE_RENE.push(_msg)
    } else {
      unseenMsgs.BABE_EZIEL.push(_msg)
    }
    // emit to the sender
    socket.emit(Events.SENT, JSON.stringify(_msg))
  })

  socket.on(Events.OFFLINE, (room) => {
    socket.broadcast.to(room).emit(Events.OFFLINE)
  })

  socket.on(Events.RECEIVE, (user, room, msg) => {
    if (user === Users.RENE) {
      unseenMsgs.BABE_EZIEL.forEach(elem => {
        elem.STAT = Status.SEEN
      })
    } else {
      unseenMsgs.BABE_RENE.forEach(elem => {
        elem.STAT = Status.SEEN
      })
    }

    socket.broadcast.to(room).emit(Events.RECEIVE, msg)
  })

  socket.on(Events.DEL_UNSEEN, (user, room) => {
    if (user === Users.RENE) {
      unseenMsgs.BABE_RENE = []
    } else {
      unseenMsgs.BABE_EZIEL = []
    }
  })

})

const PORT = process.env.PORT || 2022
server.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})