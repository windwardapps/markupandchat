const Sequelize = require('sequelize');
const db = require('../db/db');

const Room = db.define('room', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    default: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING
  },
  imageSrc: {
    type: Sequelize.STRING
  },
  createdBy: {
    type: Sequelize.UUID
  }
});

module.exports = Room;
