require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);

let users = new Array();

io.on('connection', (socket) => {
    //console.log('Socket-io connected');

    socket.on('initLobbies', () => {
        io.emit('lobbiesInited');
    });

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
        const userObj = { uuid: player.uuid, socketId: socket.id, name: player.name };
        users.push(userObj);
        io.emit('playerAdded', player);
    });

    socket.on('playerReturnedFromGame', (player) => {
        const userObj = { uuid: player.uuid, socketId: socket.id, name: player.name };
        users = users.map(user => user.uuid !== player.uuid ? user : userObj);
        //console.log('users AFTER RETURNED FROM GAME', users);
        io.emit('playerAdded', player);
    });

    socket.on('updatePlayerSocketId', (player) => {
        const userObj = { uuid: player.uuid, socketId: socket.id, name: player.name };
        users = users.map(user => user.uuid !== player.uuid ? user : userObj);
        //console.log('users AFTER UPDATE', users);
    });

    socket.on('removePlayer', (player) => {
        io.emit('playerRemoved', player);
    });

    socket.on('playerToEdit', (player) => {
        io.emit('editedPlayer', player);
    });

    socket.on('diceThrow', (player, amount) => {
        io.emit('thrownDice', player, amount);
    });

    socket.on('inGamePlayerToEdit', (player) => {
        io.emit('inGameEditedPlayer', player);
    });

    socket.on('inGamePlayersTurnEdit', (players) => {
        io.emit('inGamePlayersEditedTurn', players);
    });

    socket.on('removeInGamePlayer', (player) => {
        io.emit('inGamePlayerRemoved', player);
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

    socket.on('setCounter', (player) => {
        io.emit('counterSet', player);
    })

    socket.on('disconnect', () => {
        //console.log('SOCKET', socket.conn.transport.readyState);
        if (socket.conn.transport.readyState === 'closed') { // tämä tarkistaa, että selain on sammutettu, eikä SocketsLobby tai -Game komponentti ole sulkeutunut
            //console.log('user on poistunut');
            //console.log('users WHEN LEAVING', users);
            //console.log('socket.id', socket.id);
            const userThatIsLeaving = users.find(user => user.socketId === socket.id);
            users = users.filter(user => user.socketId !== socket.id);
            //console.log('userThatIsLeaving', userThatIsLeaving);
            if (userThatIsLeaving) { // tarkistaa että user on olemassa
                io.emit('playerRemoved', userThatIsLeaving);
                io.emit('inGamePlayerRemovedAndFromLobby', userThatIsLeaving);
            }
        }
    });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});