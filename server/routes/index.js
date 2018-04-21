const express = require('express');
const uuid = require('uuid/v4');
const User = require('../models/User')

const router = express.Router();

const in100years = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  return date;
}

router.get('/', async (req, res, next) => {
  if (!req.cookies.markup_id) {
    const id = uuid();
    const user = await User.create({ id: id, name: `awesome-user-${id}` });
    res.cookie('markup_id', user.id, { expires: in100years() });
  }

  res.render('index', { title: 'Express' });
});

module.exports = router;
