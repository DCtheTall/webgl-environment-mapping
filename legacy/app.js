const express = require('express');

const app = express();

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.render('index'));

module.exports = app;
