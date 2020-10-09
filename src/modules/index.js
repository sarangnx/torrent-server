const router = require('express').Router();

// Import routes from each module
const Torrent = require('./torrent/torrent.route')(router);

module.exports = function (app) {
    app.use('/torrent', Torrent);
};
