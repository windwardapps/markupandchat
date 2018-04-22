const io = require('socket.io');
const http = require('http');
const uuid = require('uuid/v4');
const Sequelize = require('sequelize');
const Message = require('./models/Message');
const User = require('./models/User');
const RoomUser = require('./models/RoomUser');

let wsServer;
let socketRoomMap = {};

async function onJoinRoom(socket, data) {
  const roomId = data.roomId;
  const userId = data.userId;
  socket.join(roomId);
  socketRoomMap[socket.id] = roomId;

  await RoomUser.getOrCreate(roomId, userId);
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

function emit(room, eventName, data) {
  wsServer.to(room).emit(eventName, data);
}

exports.emit = emit;

exports.updateRoomUsers = async function updateRoomUsers(roomId) {
  const roomUsers = await RoomUser.findAll({
    where: {
      roomId
    }
  });

  const users = await User.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: roomUsers.map(ru => ru.userId)
      }
    }
  });

  emit(roomId, 'updateusers', users);
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