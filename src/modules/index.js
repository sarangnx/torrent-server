const router = require('express').Router();
const { APIError } = require('../utils/error');

// Import routes from each module
const Torrent = require('./torrent/torrent.route')(router);

module.exports = function (app) {
    app.use('/torrent', Torrent);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(new APIError('Requested URL Not Found', 404));
    });
};
