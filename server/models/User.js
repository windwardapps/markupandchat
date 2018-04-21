const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    default: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  }
});

module.exports = User;
