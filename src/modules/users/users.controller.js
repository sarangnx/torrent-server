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
    }
};
