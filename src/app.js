const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const routes = require('./modules');

// create express app and server
const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// register routes
routes(app);

module.exports.app = app;
module.exports.server = server;
