const Service = require('./torrent.service');

module.exports = {
    async addTorrent(req, res, next) {
        // req.body is used when magnet uri or torrent url is used.
        const data = req.body || {};

        // If file is uploaded, file buffer is passed.
        if (req.file) {
            data.torrent = req.file;
        }

        await Service.addTorrent(data);
        res.json({ message: 'Torrent Added.' });
    }
};
