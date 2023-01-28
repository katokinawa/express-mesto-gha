const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { SECRET_KEY } = process.env;
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');
const Conflict = require('../errors/Conflict');

const ok = 200;

module.exports.getUsers = (req, res, next) => {
  // Получить массив пользователей, то есть всех
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.findUserById = (req, res, next) => {
  // Найти по ID
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return next(new NotFound('Пользователь по указанному _id не найден.'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Некорректный _id пользователя.'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res) => {
  // Создать пользователя
  const {
    name, about, avatar, email, next,
  } = req.body;
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new BadRequest(
            'Переданы некорректные данные при создании пользователя.',
          ),
        );
      } else if (err.code === 11000) {
        next(new Conflict('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return next(new NotFound('Пользователь с указанным _id не найден.'));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequest('Переданы некорректные данные при обновлении профиля.'),
        );
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((updateAvatar) => res.send({ data: updateAvatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequest('Переданы некорректные данные при создании карточки.'),
        );
      }
      return next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFound('Пользователь по указанному _id не найден.'));
      }
      return res.status(ok).send({ data: user });
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SECRET_KEY);
      // вернём токен
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
          credentials: 'include',
        })
        .end();

      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        // хеши не совпали — отклоняем промис
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      // аутентификация успешна
      return res.send({ message: 'Всё верно!' });
    })
    .catch((err) => {
      res.status(Unauthorized).send({ message: err.message });
    });
};
