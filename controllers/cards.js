const Card = require('../models/card');

const badRequest = 400;
const notFound = 404;
const internalServerError = 500;

module.exports.getCards = (req, res) => {
  // Получить массив всех карточек
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res
      .status(internalServerError)
      .send({ message: 'Что-то пошло не так...' }));
};

module.exports.createCard = (req, res) => {
  // Создать карточку
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
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

module.exports.deleteCard = (req, res) => {
  // Удалить карточку
  Card.findByIdAndDelete(req.params.id)
    .then((card) => {
      if (!card) {
        return res
          .status(notFound)
          .send({ message: 'Карточка с указанным _id не найдена.' });
      }
      return res.send({ data: card });
    })
    .catch(() => {
      res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((like) => {
      if (!like) {
        return res
          .status(notFound)
          .send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((like) => {
      if (!like) {
        return res
          .status(notFound)
          .send({ message: 'Передан несуществующий _id карточки.' });
      }
      return res.send({ data: like });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      return res
        .status(internalServerError)
        .send({ message: 'Что-то пошло не так...' });
    });
};
