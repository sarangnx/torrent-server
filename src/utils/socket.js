const socketio = require('socket.io');

class SocketIO {
    constructor() {
        // create io without http.Server. It is binded later.
        this.io = new socketio({
            transports: ['websocket', 'polling']
        });

        // start listening to clients
        this.init();
    }

    /**
     * Bind to an http server later.
     *
     * @param {http.Server} server - Server to bind to
     */
    attach(server) {
        this.io.attach(server);
    }

    /**
     * Start listening to client connections
     */
    init() {
        this.io.on('connection', (socket) => {
            socket.on('join:room', (roomId) => {
                socket.join(roomId);
            });
        });
    }

    /**
     * Send Error / Success message to client using rooms
     *
     * @param {Object} data - Message options
     * @param {String} data.roomId - Room Id
     * @param {String} data.message - Message String
     * @param {String} data.type - Message Type
     */
    message(data) {
        this.io.sockets.to(data.roomId).emit(`message`, { message: data.message, type: data.type });
    }

    /**
     * Send Progress to client
     *
     * @param {Object} data - Progress data
     * @param {String} roomId - Room Id
     */
    progress(data, roomId) {
        this.io.sockets.to(roomId).emit('progress', data);
    }

    /**
     * Generic function used to emit socket events
     *
     * @param {Object} options
     * @param {String} options.roomId - Room Id
     * @param {String} options.event - event name
     * @param {Object | String} options.data - Data to be sent
     */
    emit(options) {
        this.io.sockets.to(options.roomId).emit(options.event, options.data);
    }
}

module.exports = new SocketIO();
