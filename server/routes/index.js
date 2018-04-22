const express = require('express');
const uuid = require('uuid/v4');
const User = require('../models/User')
const getOrCreateUser = require('./shared').getOrCreateUser;

const debug = require('debug')('chat:routes:index');

const router = express.Router();

const in100years = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  return date;
}

router.get('/', async (req, res, next) => {
  await getOrCreateUser(req, res);

  res.render('index');
});

module.exports = router;