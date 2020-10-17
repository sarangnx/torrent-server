const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./modules');
const { handler } = require('./utils/error');

// create express app and server
const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// register routes
routes(app);

// Resiter Error handler
app.use(handler);

module.exports.app = app;
module.exports.server = server;
