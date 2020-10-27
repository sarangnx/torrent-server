const Controller = require('./users.controller');

module.exports = function (router) {
    router.post('/users/add', Controller.addUser);

    return router;
};
