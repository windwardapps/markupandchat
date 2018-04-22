const Sequelize = require('sequelize');

module.exports = new Sequelize('db', null, null, {
  dialect: 'sqlite',
  storage: __dirname + '/db.sqlite3'
});
