const io = require('socket.io');
const http = require('http');
const uuid = require('uuid/v4');
const Message = require('./models/Message');
const RoomUser = require('./models/RoomUser');

let wsServer;
let socketRoomMap = {};

async function onJoinRoom(socket, data) {
  const roomId = data.roomId;
  const userId = data.userId;
  socket.join(roomId);
  socketRoomMap[socket.id] = roomId;

  const roomUser = await RoomUser.findAll({
    where: {
      roomId,
      userId
    }
  });

  if (!roomUser) {
    RoomUser.create({ roomId, userId });
  }
}

async function onChatMessage(socket, data) {
  const roomId = socketRoomMap[socket.id];
  const message = await Message.create({
    id: uuid(),
    roomId,
    createdBy: data.userId,
    text: data.text
  });

  wsServer.to(roomId).emit('chatmessage', message.get());
}

function onCreateShape(socket, data) {
  debugger;
}

function onUpdateShape(socket, data) {
  debugger;
}

exports.emit = function emit(room, eventName, data) {
  wsServer.to(room).emit(eventName, data);
};

exports.createWebsocketServer = function createWebsocketServer(app) {
  const httpServer = http.Server(app);
  wsServer = io(httpServer);

  wsServer.on('connection', socket => {
    console.log('a user connected');
    socket.on('joinroom', data => onJoinRoom(socket, data));
    socket.on('chatmessage', data => onChatMessage(socket, data));
    socket.on('createshape', data => onCreateShape(socket, data));
    socket.on('updateshape', data => onUpdateShape(socket, data));
  });

  httpServer.listen(3002, function() {
    console.log('websocket server listening on *:3002');
  });
};
