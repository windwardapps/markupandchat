const express = require('express');
const uuid = require('uuid/v4');
const User = require('../models/User');
const Room = require('../models/Room');

const debug = require('debug')('chat:routes:rooms');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const room = await Room.create({
    id: uuid(),
    createdBy: req.user.id
  });

  return res.redirect('room');
});

module.exports = router;