const express = require('express');
const morgan = require('morgan');
const { join, resolve } = require('path');

const app = express();

app.use(morgan('dev'));
app.use(express.static(join(resolve('.'), 'public')));
app.set('view engine', 'pug');
app.set('views', join(resolve('.'), 'views'));
app.get('/', (_, res) =>
    res.render('index', { dev: process.env.NODE_ENV === 'development' }));

module.exports = app;
