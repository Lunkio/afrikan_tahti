import lobbyService from './services/lobbyService';
import { lobbySocket } from './SocketsLobby';
import { gameSocket } from './SocketsGame';

export const updateLobbyAndPlayer = async (player, thisLobby, status) => {
    try {
        const playerToEdit = thisLobby.playersInLobby.find(p => p.uuid === player.uuid);
        playerToEdit.color = player.color;
        playerToEdit.lobbyReady = player.lobbyReady;
        const updatedPlayers = thisLobby.playersInLobby.map(p => p.uuid !== playerToEdit.uuid ? p : playerToEdit);
        thisLobby.playersInLobby = updatedPlayers;
        const updatedLobby = await lobbyService.editLobby(thisLobby);
        lobbySocket.emit('lobbyToEdit', updatedLobby);
        if (status === 'lobbyComponent') {
            lobbySocket.emit('playerToEdit', player);
        }
    } catch (e) {
        console.log('error', e);
    }
};

export const removePlayerFromLobby = async (player, status) => {
    try {
        const lobbies = await lobbyService.getAllLobbies();
        const lobbyToRemovePlayer = lobbies.find(lobby => lobby.playersInLobby.find(p => p.uuid === player.uuid));
        if (lobbyToRemovePlayer) {
            const playerRemoved = lobbyToRemovePlayer.playersInLobby.filter(p => p.uuid !== player.uuid);
            lobbyToRemovePlayer.playersInLobby = playerRemoved;
            const updatedLobby = await lobbyService.editLobby(lobbyToRemovePlayer);
            if (status === 'lobbySocketIsActivated') {
                lobbySocket.emit('lobbyToEdit', updatedLobby);
            }
            if (status === 'gameSocketIsActivated') {
                gameSocket.emit('removeInGamePlayer', player);
            }
        }
    } catch (e) {
        console.log('error', e);
    }
};

export const setDefaultPlayerProperties = (player, status) => {
    player.color = '';
    player.lobbyReady = false;
    player.startReady = false;
    player.stepControl = 0;
    player.flightControl = 0;
    player.coordX = 0;
    player.coordY = 0;
    player.turnOrder = Math.ceil(Math.random() * 10000);
    player.canPlay = false;
    player.hasMoved = false;
    player.stepsRemain = 0;
    player.hasFlown = false;
    player.flightTicket = false;
    player.boatTicket = false;
    player.freeBoatTicket = false;
    player.money = 300;
    player.hasWatchedTreasure = false;
    player.hasGambled = false;
    player.hasStar = false;
    player.hasShoe = false;
    player.firstInCapeTown = false;
    player.firstInGoldCoast = false;
    player.winner = false;
    if (status === 'leaving') {
        player.inLobby = false;
        player.lobbyuuid = '';
        player.host = false;
        player.lobbyCreator = false;
    }
};

let tokens = [
    { type: 'tahti', moneyValue: 0 },
    { type: 'punainen', moneyValue: 1000 },
    { type: 'punainen', moneyValue: 1000 },
    { type: 'vihrea', moneyValue: 600 },
    { type: 'vihrea', moneyValue: 600 },
    { type: 'vihrea', moneyValue: 600 },
    { type: 'keltainen', moneyValue: 300 },
    { type: 'keltainen', moneyValue: 300 },
    { type: 'keltainen', moneyValue: 300 },
    { type: 'keltainen', moneyValue: 300 },
    { type: 'rosvo', moneyValue: 0 },
    { type: 'rosvo', moneyValue: 0 },
    { type: 'rosvo', moneyValue: 0 },
    { type: 'kenka', moneyValue: 0 },
    { type: 'kenka', moneyValue: 0 },
    { type: 'kenka', moneyValue: 0 },
    { type: 'kenka', moneyValue: 0 },
    { type: 'kenka', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
    { type: 'tyhja', moneyValue: 0 },
];

export default tokens;