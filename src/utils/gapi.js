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

    /**
     * Cache already created folder's id here
     */
    folders = {};

    /**
     * Create folders recursively with BlackPearl as base folder
     * ~/BlackPearl/path
     *
     * @param {String} path - Path string seperated by '/'
     *
     * @returns {String} Id of the innermost folder
     */
    async createFolder(path) {
        // return cached value.
        if (Object.keys(this.folders).includes(path) && this.folders[path].id) {
            return this.folders[path].id;
        }

        const q = 'trashed=false and mimeType="application/vnd.google-apps.folder" and "me" in owners';

        // get ~/BlackPearl folder in Drive
        const res = await this.drive.files.list({
            q: `${q} and name="BlackPearl" and "root" in parents`,
            fields: 'files(id, name, parents)',
            spaces: 'drive'
        });

        let root = res.data.files[0];

        // If root folder ~/BlackPearl does not exist, create one.
        if (!root || !res.data.files.length) {
            const res = await this.drive.files.create({
                resource: {
                    name: 'BlackPearl',
                    mimeType: 'application/vnd.google-apps.folder'
                },
                fields: 'id, name, parents'
            });

            root = res.data;
        }

        // set current directory as root for now
        let cwd = Object.assign({}, root);
        let parts = path.split('/');

        for (let index in parts) {
            let part = parts[index];
            // current path
            let p = parts.slice(0, parseInt(index) + 1).join('/');

            // use cached value
            if (Object.keys(this.folders).includes(p) && this.folders[p].id) {
                cwd = Object.assign({}, this.folders[p]);
                continue;
            }

            // search for folder in drive that has cwd as parent
            const res = await this.drive.files.list({
                q: `${q} and name="${part}" and "${cwd.id}" in parents`,
                fields: 'files(id, name, parents)',
                spaces: 'drive'
            });

            if (!res.data.files || !res.data.files.length) {
                // create folder if it does not exist
                const res = await this.drive.files.create({
                    resource: {
                        name: part,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [cwd.id]
                    },
                    fields: 'id, name, parents'
                });

                cwd = Object.assign({}, res.data);
            } else {
                cwd = Object.assign({}, res.data.files[0]);
            }

            // push to cache
            this.folders[p] = Object.assign({}, cwd);
        }

        return cwd.id;
    }

    /**
     * Upload a file to google drive.
     * File is uploaded to BlackPearl/path
     *
     * @param {String} path - Full path including the file name
     * @param {ReadableStream} stream - File stream to be uploaded to drive
     */
    async upload(path, stream) {
        // extract filename from path
        path = path.split('/');
        const filename = path.pop();
        path = path.join('/');

        // create folder in google drive
        const Folder = await this.createFolder(path);

        // upload file to google drive
        await this.drive.files.create({
            resource: { name: filename, parents: [Folder] },
            media: { body: stream }
        });
    }
};
