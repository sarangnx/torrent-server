const Controller = require('./users.controller');

module.exports = function (router) {
    router.post('/users/add', Controller.addUser);

    router.get('/auth/login', Controller.generateURL);

    router.get('/auth/callback', Controller.authCallback);

    return router;
};
