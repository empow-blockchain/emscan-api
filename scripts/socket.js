const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var clientGetBlock = {}
var clientGetBlockCheckPoint = {}

server.listen(8000);

var connection = 0;

io.on('connection', (client) => {

    connection++
    // console.log("connection: " + connection)

    client.on('get_new_block', (data) => {
        clientGetBlock[client.id] = client
    });

    client.on('disconnect', () => {
        connection--
        // console.log("connection: " + connection)

        if (clientGetBlockCheckPoint.hasOwnProperty(client.id)) {
            delete clientGetBlock[client.id]
        }
    });
});

function emitNewBlock(data) {
    Object.keys(clientGetBlock).map((clientSocketId) => {
        let socket = clientGetBlock[clientSocketId]
        socket.emit("res_new_block", data)
    })
}


module.exports = {
    emitNewBlock: emitNewBlock,
}