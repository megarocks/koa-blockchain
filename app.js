const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const route = require('koa-route')

const WebSocket = require('ws')
const sockets = []

const BlockChain = require('./BlockChain')
const blockChain = new BlockChain()

const startHttpServer = () => {
  const httpPort = process.env.HTTP_PORT || 3000
  const httpServer = new Koa()

  httpServer.use(bodyParser())

  httpServer.use(route.post('/blocks', (ctx) => {
    const data = ctx.request.body
    const newBlock = blockChain.generateNextBlock(data)
    if (blockChain.addBlock(newBlock)) {

      broadcastMessage({
        type: 'NEW_BLOCK',
        payload: newBlock
      })

      ctx.body = blockChain.blocks
    } else {
      ctx.throw(400, 'failed to add block')
    }
  }))

  httpServer.use(route.get('/blocks', (ctx) => {
    ctx.body = blockChain.blocks
  }))

  httpServer.use(route.post('/peers', (ctx) => {
    const peer = ctx.request.body.peer
    const socket = new WebSocket(peer)
    socket.on('open', () => { handleSocketConnection(socket) })
    ctx.body = 'ok'
  }))

  httpServer.listen(httpPort, () => { console.log('http server is listening port: ' + httpPort) })
}
startHttpServer()


const startP2PServer = () => {
  const p2pPort = process.env.P2P_PORT || 7000
  const server = new WebSocket.Server({port: p2pPort})
  server.on('connection', handleSocketConnection)
  console.log('p2p server is listening at port: ' + p2pPort)
}

startP2PServer()



function handleSocketConnection(socket) {

  const {
    _socket: {
      localAddress,
      localPort,
      remoteAddress,
      remotePort
    }
  } = socket

  console.log(`new connection: ${localAddress}:${localPort}<-->${remoteAddress}:${remotePort}`)
    sockets.push(socket)

    socket.on('message', (message) => {
      const data = JSON.parse(message)
      switch (data.type) {
        case 'NEW_BLOCK': {
          blockChain.addBlock(data.payload)
        }
      }
    })

    socket.on('close', () => {
      console.log('closing socket connection')
      sockets.splice(sockets.indexOf(socket), 1)
    })

    socket.on('error', () => {
      console.log('error at socket connection')
      sockets.splice(sockets.indexOf(socket), 1)
    })
}

function sendMessageToSocket(socket, message){
  socket.send(JSON.stringify(message))
}

function broadcastMessage (message) {
  sockets.forEach(socket => {
    sendMessageToSocket(socket, message)
  })
}