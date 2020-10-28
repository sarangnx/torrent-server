const Service = require('./users.service');

module.exports = {
    addUser(req, res, next) {
        try {
            const { uid } = req.body;

            Service.addUser(uid);
            res.json({ message: 'User Added.' });
        } catch (err) {
            next(err);
        }
    },

    async generateURL(req, res, next) {
        try {
            const { uid } = req.query;

            const url = await Service.generateURL(uid);

            // redirect to generated url for authorization
            res.redirect(url);
        } catch (err) {
            next(err);
        }
    },

    async authCallback(req, res, next) {
        try {
            const data = req.query;

            await Service.authCallback(data);

            // redirect back to web app
            res.redirect(`${process.env.WEBAPP_URI}/torrent`);
        } catch (err) {
            next(err);
        }
    }
};
