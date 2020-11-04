const Service = require('./torrent.service');

module.exports = {
    async addTorrent(req, res, next) {
        try {
            // req.body is used when magnet uri or torrent url is used.
            const data = req.body || {};

            // If file is uploaded, file buffer is passed.
            if (req.file) {
                data.torrent = req.file;
            }

            const metadata = await Service.addTorrent(data);
            res.json({ message: 'Torrent Added.', metadata });
        } catch (err) {
            next(err);
        }
    },

    async listTorrent(req, res, next) {
        try {
            const { uid } = req.query;

            const torrents = Service.listTorrent(uid);
            res.json({ torrents });
        } catch (err) {
            next(err);
        }
    },

    async download(req, res, next) {
        try {
            const data = req.body;

            res.json({ message: 'Download Request Recieved' });
            await Service.download(data);
        } catch (err) {
            next(err);
        }
    },

    async deleteTorrent(req, res, next) {
        try {
            const data = req.body;

            await Service.deleteTorrent(data);
            res.json({ message: 'Torrent Removed.' });
        } catch (err) {
            next(err);
        }
    }
};
