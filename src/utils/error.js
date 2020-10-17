/**
 * Custom Error Class
 *
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP Status code
 * @param {Boolean} isOperational - Operational error defaults to true
 */
class APIError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports.APIError = APIError;

/**
 * Error Handler Middleware, catches errors,
 * sends appropriate HTTP response.
 */
module.exports.handler = function (err, req, res, next) {
    // send error message only in case of operational error
    const response = err.isOperational ? { message: err.message } : { message: 'Something went wrong.' };

    // error code
    const code = parseInt(err.statusCode, 10) || 500;

    res.status(code).json(response);
};
