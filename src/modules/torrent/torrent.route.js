const Controller = require('./torrent.controller');
const { upload } = require('../../utils/multer');

module.exports = function (router) {
    router.post('/add', upload.single('torrent'), Controller.addTorrent);

    router.get('/list', Controller.listTorrent);

    router.post('/download', Controller.download);

    router.delete('/delete', Controller.deleteTorrent);

    return router;
};
