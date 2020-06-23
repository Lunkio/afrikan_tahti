import lobbyService from './services/lobbyService';
import { lobbySocket } from './index';

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

export const removePlayerFromLobby = async (player) => {
    try {
        const lobbies = await lobbyService.getAllLobbies();
        const lobbyToRemovePlayer = lobbies.find(lobby => lobby.playersInLobby.find(p => p.uuid === player.uuid));
        if (lobbyToRemovePlayer) {
            const playerRemoved = lobbyToRemovePlayer.playersInLobby.filter(p => p.uuid !== player.uuid);
            lobbyToRemovePlayer.playersInLobby = playerRemoved;
            const updatedLobby = await lobbyService.editLobby(lobbyToRemovePlayer);
            lobbySocket.emit('lobbyToEdit', updatedLobby);
        }
    } catch (e) {
        console.log('error', e);
    }
};