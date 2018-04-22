const User = require('../models/User');
const Room = require('../models/Room');
const RoomUser = require('../models/RoomUser');
const Message = require('../models/Message');

User.sync();
Room.sync();
RoomUser.sync();
Message.sync();
