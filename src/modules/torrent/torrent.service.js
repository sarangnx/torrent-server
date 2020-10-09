const axios = require('axios');
const WebTorrent = require('webtorrent');
const parseTorrent = require('parse-torrent');
const { isMagnetURI, isURL } = require('validator');

module.exports = {
    /**
     * Store queued torrent magnet uri, file or link
     */
    torrents: [],

    /**
     * Parse torrent from magnet, file or link to torrent file
     * and return list of files.
     *
     * @param {Object} data
     * @param {String|Object} data.torrent - Magnet URI, torrent file buffer or link to torrent file
     */
    async addTorrent(data = {}) {
        if (!data.torrent) throw new Error('A torrent file, magnet uri or link to torrent file required.');

        const parsed = await this.parse(data.torrent);
    },

    /**
     * Parse Torrent and return metadata.
     *
     * @param {String|Object} torrent - Magnet URI, torrent file buffer or link to torrent file
     */
    async parse(torrent) {
        /**
         * Torrent is parsed using parse-torrent library
         * and a `so` property is added to the parsed Object.
         *
         * more details about why it is added is available in:
         * https://github.com/webtorrent/webtorrent/issues/164#issuecomment-703489174
         */
        if (typeof torrent === 'object' || torrent instanceof Object) {
            // Parse Torrent File buffer
            try {
                torrent = parseTorrent(torrent.buffer);
                torrent.so = '-1';
            } catch (err) {
                throw new Error('Invalid Torrent File.');
            }
        } else if (isMagnetURI(torrent)) {
            // Parse Magnet URI
            try {
                torrent = parseTorrent(torrent);
                torrent.so = '-1';
            } catch (err) {
                throw new Error('Invalid Magnet URI.');
            }
        } else if (isURL(torrent)) {
            // fetch torrent from url and parse
            try {
                const res = await axios.get(torrent, {
                    responseType: 'arraybuffer'
                });

                torrent = parseTorrent(res.data);
                torrent.so = '-1';
            } catch (err) {
                throw new Error('URL returned an invalid torrent.');
            }
        } else {
            throw new Error('A valid torrent file, magnet uri or link to torrent file required.');
        }

        // Get complete metadata of the torrent using webtorrent client.
        // when using magnet links parse-torrent does not provide list of files.
        const metadata = await new Promise((resolve) => {
            const client = new WebTorrent();
            client.add(torrent, (t) => resolve(t));
        });

        return metadata;
    }
};
