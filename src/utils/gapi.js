const { google } = require('googleapis');

module.exports = class Gapi {
    constructor(tokens = null) {
        this.client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URL
        );

        this.drive = google.drive({
            version: 'v3',
            auth: this.client
        });

        if (tokens) {
            this.setToken(tokens);
        }
    }

    // authorization scopes required
    scopes = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.profile'];

    /**
     * Set access token and refresh token to google api client instance
     *
     * @param {Object} tokens - Tokens for authorization
     */
    setToken(tokens) {
        this.client.setCredentials(tokens);
    }

    /**
     * Generate URL for selecting google account for authorization
     *
     * @param {String} uid - UUID4 User ID
     */
    async geneateURL(uid) {
        const url = await this.client.generateAuthUrl({
            scope: this.scopes,
            prompt: 'select_account',
            access_type: 'offline',
            state: uid // uid is passed with auth request to maintain state after auth flow
        });

        return url;
    }
};
