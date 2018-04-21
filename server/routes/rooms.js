const express = require('express');
const uuid = require('uuid/v4');
const User = require('../models/User');
const Room = require('../models/Room');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const room = await Room.create({ id: uuid(), createdBy: req.user.id });
  return res.json(room.get({ plain: true }));
});

module.exports = router;
