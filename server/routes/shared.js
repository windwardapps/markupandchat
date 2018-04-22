const uuid = require('uuid/v4');
const User = require('../models/User')

const debug = require('debug')('chat:routes:shared');

const in100years = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  return date;
}

exports.getOrCreateUser = async (req, res) => {
  let user = await User.findById(req.cookies.markup_id);
  if (!user) {
    const id = uuid();
    debug(`Creating user with id ${id}`);
    user = await User.create({
      id: id,
      name: `awesome-user-${id}`
    });

    res.cookie('markup_id', user.id, {
      expires: in100years()
    });
  }
  
  return user;
}
