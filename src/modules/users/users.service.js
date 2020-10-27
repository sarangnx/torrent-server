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
    }
};
