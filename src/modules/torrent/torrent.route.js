const Controller = require('./torrent.controller');
const { upload } = require('../../utils/multer');

module.exports = function (router) {
    router.post('/add', upload.single('torrent'), Controller.addTorrent);

    return router;
};