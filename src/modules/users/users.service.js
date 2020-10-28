const { APIError } = require('../../utils/error');
const Gapi = require('../../utils/gapi');

module.exports = {
    /**
     * Store User details
     *
     * format
     * users: {
     *   [uid]: {
     *     token: 'string'
     *   }
     * }
     */
    _users: {},

    /**
     * Add an entry for new user
     *
     * @param {String} uid - UUID4 User ID
     */
    addUser(uid) {
        if (!uid) throw new APIError('User ID Missing. Please Reload Client.', 400);

        // quit if user already added to list
        if (this._users[uid]) return;

        this._users[uid] = {};
    },

    /**
     * Get details of user
     *
     * @param {String} uid - UUID4 User ID
     */
    getUser(uid) {
        if (!uid) throw new APIError('User ID Required.', 400);

        return this._users[uid];
    },

    /**
     * Generate URL for google oauth flow
     *
     * @param {String} uid - UUID4 User ID
     */
    async generateURL(uid) {
        const gapi = new Gapi();
        this.addUser(uid);

        const url = await gapi.geneateURL(uid);
        return url;
    },

    /**
     * Handle redirect from google auth server. Use code from google
     * server to acquire tokens, and set them to client instance.
     *
     * @param {Object} data - Data from callback query params
     * @param {String} data.state - UUID4 User ID
     * @param {String} data.code - Code returned from google auth server
     */
    async authCallback(data) {
        const gapi = new Gapi();
        const uid = data.state;

        const { tokens } = await gapi.client.getToken(data.code);

        this._users[uid].tokens = tokens;
    }
};
