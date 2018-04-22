const express = require('express');
const uuid = require('uuid/v4');
const User = require('../models/User');
const Room = require('../models/Room');
const RoomUser = require('../models/RoomUser');
const Message = require('../models/Message');
const getOrCreateUser = require('./shared').getOrCreateUser;

const debug = require('debug')('chat:routes:rooms');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.sendStatus(404);
    }

    const user = await getOrCreateUser(req, res);
    const users = await User.findAll();
    await RoomUser.getOrCreate(room.id, user.id);
    const roomUsers = await RoomUser.findAll({ where: { roomId: room.id } });
    const messages = await Message.findAll({ where: { roomId: room.id } });

    return res.json({
      room,
      user,
      messages,
      users: users.filter(u => !!roomUsers.find(ru => ru.userId === u.id))
    });
  } catch (err) {
    return res.sendStatus(400);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await getOrCreateUser(req, res);
    const room = await Room.create({
      id: uuid(),
      createdBy: user.id
    });

    return res.json(room.get());
  } catch (err) {
    return res.sendStatus(400);
  }
});

module.exports = router;