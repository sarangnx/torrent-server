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
            console.log('connected');
            socket.on('disconnect', () => {
                console.log('disconnected');
            });

            socket.on('join:room', (roomId) => {
                socket.join(roomId);
            });
        });
    }
}

module.exports = new SocketIO();
