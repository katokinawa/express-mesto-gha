const User = require('../models/user');

const badRequest = 400;
const notFound = 404;
const internalServerError = 500;

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
        res.send({ data: user });
      } else {
        res
          .status(notFound)
          .send({ message: 'Пользователь по указанному _id не найден.' });
      }
    })
    .catch(() => {
      res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.createUser = (req, res) => {
  // Создать пользователя
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(badRequest)
          .send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res
          .status(notFound)
          .send({ message: 'Пользователь с указанным _id не найден.' });
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((updateAvatar) => res.send({ data: updateAvatar }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(badRequest)
          .send({ message: 'Переданы некорректные данные при создании карточки.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};
