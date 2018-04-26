const Sequelize = require('sequelize');
const db = require('../db/db');

const Shape = db.define('shape', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    default: Sequelize.UUIDV4
  },
  roomId: {
    type: Sequelize.UUID
  },
  type: {
    type: Sequelize.STRING
  },
  data: {
    type: Sequelize.JSON
  },
  createdBy: {
    type: Sequelize.UUID
  }
});

module.exports = Shape;
