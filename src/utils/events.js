const EventEmitter = require('events');
const { APIError } = require('./error');
const socket = require('./socket');

/**
 * Custom Event Emitter class
 */
class Events extends EventEmitter {
    /**
     * Used like throw new Error
     *
     * @param {Error} err - Error Object
     */
    error(err) {
        this.emit('error', err);
    }
}

const events = new Events();

// send error message to client
events.on('error', (err) => {
    if (err instanceof APIError) {
        socket.message({
            roomId: err.roomId,
            message: err.message,
            type: 'error'
        });
    }
});

module.exports = events;
