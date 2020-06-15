require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('Socket-io connected');

    socket.on('addTokens', (tokens) => {
        io.emit('tokensAdded', tokens);
    });
    
    socket.on('addPlayer', (player) => {
        io.emit('playerJoined', player);
    });

    socket.on('removePlayer', (player) => {
        io.emit('playerRemoved', player);
    });

    socket.on('playerToEdit', (player) => {
        io.emit('editedPlayer', player);
    });

    socket.on('revealLandingSpot', (spot) => {
        io.emit('landingSpotRevealed', spot);
    });

    socket.on('starIsFound', () => {
        io.emit('starFound');
    });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = io;