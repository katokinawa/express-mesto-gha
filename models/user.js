// models/user.js
const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');
const Unauthorized = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => isEmail(email),
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((userData) => {
      if (!userData) {
        return Promise.reject(
          new Unauthorized('Неверный email или пароль'),
        );
      }
      return bcrypt.compare(password, userData.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new Unauthorized('Неверный email или пароль'),
          );
        }
        return userData;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
