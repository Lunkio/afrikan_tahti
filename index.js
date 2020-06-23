require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('Socket-io connected');

    socket.on('addLobby', (lobby) => {
        io.emit('lobbyAdded', lobby);
    });

    socket.on('lobbyToEdit', (lobby) => {
        io.emit('editedLobby', lobby);
    });

    socket.on('removeLobby', (lobby) => {
        io.emit('lobbyRemoved', lobby);
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

    socket.on('inGamePlayerToEdit', (player) => {
        io.emit('inGameEditedPlayer', player);
    });

    socket.on('inGamePlayerToDelete', (player) => {
        io.emit('inGameDeletedPlayer', player);
    });

    socket.on('revealLandingSpot', (spot) => {
        io.emit('landingSpotRevealed', spot);
    });

    socket.on('starIsFound', (player) => {
        io.emit('starFound', player);
    });

    socket.on('addTokens', (tokens, lobby) => {
        io.emit('tokensAdded', tokens, lobby);
    });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});