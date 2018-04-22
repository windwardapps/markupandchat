const Sequelize = require('sequelize');
const db = require('../db/db');

const Message = db.define('message', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    default: Sequelize.UUIDV4
  },
  roomId: {
    type: Sequelize.UUID
  },
  text: {
    type: Sequelize.STRING
  },
  createdBy: {
    type: Sequelize.UUID
  }
});

module.exports = Message;
