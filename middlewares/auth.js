const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;
const unauthorized = 401;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(unauthorized)
      .send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res
      .status(unauthorized)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  return next();
};
