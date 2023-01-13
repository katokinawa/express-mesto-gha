const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.set('strictQuery', false);
mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => console.log('Connected!')); // обычная проверочка подключения к базе данных.

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use((req, res, next) => {
  req.user = {
    _id: '63c06f0e681b331588adba2b', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use('/users', require('./routes/user'));
app.use('/cards', require('./routes/card'));
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Неправильный путь' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
