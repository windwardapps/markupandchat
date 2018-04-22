const Sequelize = require('sequelize');
const db = require('../db/db');
const User = require('./User');

const RoomUser = db.define('room_user', {
  roomId: {
    type: Sequelize.UUID
  },
  userId: {
    type: Sequelize.UUID
  }
});

RoomUser.getOrCreate = async (roomId, userId) => {
  const roomUser = await RoomUser.find({
    where: {
      roomId,
      userId
    }
  });

  if (roomUser) {
    return roomUser;
  }

  await RoomUser.create({ roomId, userId });

  const roomUsers = await RoomUser.findAll({
    where: {
      roomId
    }
  });

  const users = await User.findAll({
    where: { id: { [Sequelize.Op.in]: roomUsers.map(ru => ru.userId) } }
  });

  require('../ws').emit(roomId, 'updateusers', users);
};

module.exports = RoomUser;
