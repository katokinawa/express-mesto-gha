const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const badRequest = 400;
const notFound = 404;
const internalServerError = 500;
const unauthorized = 401;

module.exports.getUsers = (req, res) => {
  // Получить массив пользователей, то есть всех
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res
      .status(internalServerError)
      .send({ message: 'Что-то пошло не так...' }));
};

module.exports.findUserById = (req, res) => {
  // Найти по ID
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return res
        .status(notFound)
        .send({ message: 'Пользователь по указанному _id не найден.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(badRequest)
          .send({ message: 'Некорректный _id пользователя.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.createUser = (req, res) => {
  // Создать пользователя
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(req.body.password, 10).
    then(hash =>
  User.create({ name, about, avatar, email, password: hash }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(badRequest).send({
          message: 'Переданы некорректные данные при создании пользователя.',
        });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.updateProfile = (req, res) => {
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
      return res
        .status(notFound)
        .send({ message: 'Пользователь с указанным _id не найден.' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(badRequest).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((updateAvatar) => res.send({ data: updateAvatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(badRequest).send({
          message: 'Переданы некорректные данные при создании карточки.',
        });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key');
      // вернём токен
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 604800,
          httpOnly: true,
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
      res.send({ message: 'Всё верно!' });
    })
    .catch((err) => {
      res
        .status(unauthorized)
        .send({ message: err.message });
    });
};
