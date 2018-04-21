const Sequelize = require('sequelize');
const db = require('./db');

const Room = db.define('user', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    default: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING
  },
  createdBy: {
    type: Sequelize.UUID
  }
});

module.exports = Room;
