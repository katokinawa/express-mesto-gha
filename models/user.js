// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    role: {
      name: String,
      default: 'Жак-Ив Кусто',
    },
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    role: {
      about: String,
      default: 'Исследователь',
    },
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    role: {
      avatar: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    },
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model('user', userSchema);
