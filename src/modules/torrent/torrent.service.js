const axios = require('axios');
const WebTorrent = require('webtorrent');
const parseTorrent = require('parse-torrent');
const { isMagnetURI, isURL } = require('validator');
const { APIError } = require('../../utils/error');
const UserService = require('../users/users.service');
const Gapi = require('../../utils/gapi');
const Events = require('../../utils/events');
const socket = require('../../utils/socket');

module.exports = {
    /**
     * Store queued torrent magnet uri, file or link
     *
     * storage format
     * torrents: {
     *   [uid]: [ { ...parsed-torrent }, { ...parsed-torrent } ]
     * }
     */
    torrents: {},

    /**
     * Parse torrent from magnet, file or link to torrent file
     * and return list of files.
     *
     * @param {Object} data
     * @param {String|Object} data.torrent - Magnet URI, torrent file buffer or link to torrent file
     * @param {String} data.uid - UUID4 User ID
     */
    async addTorrent(data = {}) {
        if (!data.torrent) throw new APIError('A torrent file, magnet uri or link to torrent file required.', 400);
        if (!data.uid) throw new APIError('User ID Missing. Please Reload Client.', 400);

        // add user
        UserService.addUser(data.uid);

        const parsed = await this.parse(data.torrent);

        // check if the parsed torrent is already in list of torrents of `uid`
        const index = this.torrents[data.uid]
            ? this.torrents[data.uid].findIndex((t) => t.infoHash === parsed.infoHash)
            : -1;

        if (index !== -1) {
            throw new APIError('This torrent was already added to queue.', 400);
        }

        if (!this.torrents[data.uid]) {
            this.torrents[data.uid] = [];
        }

        // get only relevent info from Files
        const files = parsed.files.map(({ name, path, length }) => ({ name, path, length }));

        // Push parsed torrents for future reference & avoid duplicates
        this.torrents[data.uid].push({
            files: files,
            name: parsed.name,
            length: parsed.length,
            infoHash: parsed.infoHash,
            magnetURI: parsed.magnetURI
        });

        return {
            files: files,
            name: parsed.name,
            length: parsed.length,
            infoHash: parsed.infoHash
        };
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
                throw new APIError('Invalid Torrent File.', 400);
            }
        } else if (isMagnetURI(torrent)) {
            // Parse Magnet URI
            try {
                torrent = parseTorrent(torrent);
                torrent.so = '-1';
            } catch (err) {
                throw new APIError('Invalid Magnet URI.', 400);
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
                throw new APIError('URL returned an invalid torrent.', 400);
            }
        } else {
            throw new APIError('A valid torrent file, magnet uri or link to torrent file required.', 400);
        }

        // Get complete metadata of the torrent using webtorrent client.
        // when using magnet links parse-torrent does not provide list of files.
        const metadata = await new Promise((resolve) => {
            const client = new WebTorrent();
            client.add(torrent, (t) => resolve(t));
        });

        return metadata;
    },

    /**
     * Get list of all torrents of a user
     *
     * @param {String} uid - UUID4 user ID
     */
    listTorrent(uid) {
        if (!uid) throw new APIError('User ID Missing.', 400);

        const torrents = this.torrents[uid];
        if (!torrents) return [];

        // strip all unimportant data before sending to frontend
        const filtered = torrents.map((t) => {
            return {
                files: t.files,
                name: t.name,
                length: t.length,
                infoHash: t.infoHash
            };
        });

        return filtered;
    },

    /**
     * Add selected torrent or part of torrent to downloads
     *
     * @param {Object} data - Torrent Details
     * @param {String} data.uid - UUID4 User ID
     * @param {String} data.name - Torrent Name
     * @param {String} data.type - Type of download (file, folder, torrent)
     * @param {Object} data.item - Details of selected file / folder
     * @param {String} data.item.name - Folder / File name
     * @param {String} data.item.path - Folder / File path
     */
    async download(data) {
        try {
            if (!data.uid) throw new APIError('User ID Missing.', 400);

            const torrents = this.torrents[data.uid];
            const user = UserService.getUser(data.uid);
            if (!user.tokens) throw new APIError('Authorize Google Drive before starting download', 401);

            const torrent = torrents.find((t) => t.name === data.name);
            const parsed = parseTorrent(torrent.magnetURI);

            const client = new WebTorrent();
            const gapi = new Gapi(user.tokens);

            client.add(parsed, async (t) => {
                socket.message({
                    roomId: data.uid,
                    message: 'Torrent Added to Download',
                    type: 'success'
                });

                // upload single file
                if (data.type === 'file') {
                    let index = t.files.findIndex((f) => f.name === data.item.name);
                    let stream = t.files[index].createReadStream();

                    await gapi.upload(t.files[index].path, stream, {
                        roomId: data.uid,
                        path: t.files[index].path
                    });
                }

                // upload a folder
                if (data.type === 'folder') {
                    for (let index in t.files) {
                        // filter files in given folder
                        if (t.files[index].path.startsWith(data.item.path)) {
                            let stream = t.files[index].createReadStream();

                            await gapi.upload(t.files[index].path, stream, {
                                roomId: data.uid,
                                path: t.files[index].path
                            });
                        }
                    }
                }

                // upload complete torrent
                if (data.type === 'torrent') {
                    for (let index in t.files) {
                        let stream = t.files[index].createReadStream();

                        await gapi.upload(t.files[index].path, stream, {
                            roomId: data.uid,
                            path: t.files[index].path
                        });
                    }
                }

                socket.message({
                    roomId: data.uid,
                    message: 'Download Completed',
                    type: 'success'
                });
            });
        } catch (err) {
            err.roomId = data.uid;
            Events.error(err);
        }
    },

    /**
     * Deletes a torrent that was previously added
     *
     * @param {Object} data - Torrent Data
     * @param {String} data.uid - UUID4 User ID
     * @param {String} data.name - Name of Torrent to be deleted
     */
    async deleteTorrent(data) {
        if (!data.uid) throw new APIError('User ID Missing. Please Reload Client.', 400);

        const index = this.torrents[data.uid].findIndex((torrent) => torrent.name === data.name);
        this.torrents[data.uid].splice(index, 1);
    }
};
