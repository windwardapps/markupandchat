const express = require('express');
const User = require('../models/User');

const debug = require('debug')('chat:routes:users');

const router = express.Router();

router.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return res.sendStatus(404);
  }

  if (req.body.name) {
    user.name = req.body.name.trim();
  }

  if (req.body.email) {
    user.email = req.body.email.trim();
  }

  await user.save();
  res.send(user);

  if (req.body.roomId) {
    const roomUsers = await RoomUser.findAll({
      where: {
        roomId
      }
    });

    const users = await User.findAll({
      where: { id: { [Sequelize.Op.in]: roomUsers.map(ru => ru.userId) } }
    });

    require('../ws').emit(req.body.roomId, 'updateusers', users);
  }
});

module.exports = router;
