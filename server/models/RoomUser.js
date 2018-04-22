const Sequelize = require('sequelize');
const db = require('../db/db');

const RoomUser = db.define('room_user', {
  roomId: {
    type: Sequelize.UUID
  },
  userId: {
    type: Sequelize.UUID
  }
});

module.exports = RoomUser;
