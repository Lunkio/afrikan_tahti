import { removePlayerFromLobby } from '../gameUtils';

const playersReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_PLAYERS':
        return action.data;
    case 'NEW_PLAYER':
        return [...state, action.data];
    case 'EDIT_PLAYER_DETAILS':
        return state.map(player => player.uuid !== action.data.uuid ? player : action.data);
    case 'REMOVE_PLAYER':
        return state.filter(player => player.uuid !== action.data);
    case 'REMOVE_ALL_PLAYERS':
        return [];
    case 'SYNC_PLAYERS':
        return action.data;
    default: return state;
    }
};

export const initPlayers = (players) => {
    return {
        type: 'INIT_PLAYERS',
        data: players
    };
};

export const newPlayer = (player) => {
    return {
        type: 'NEW_PLAYER',
        data: player
    };
};

export const editPlayerDetails = (player) => {
    return {
        type: 'EDIT_PLAYER_DETAILS',
        data: player
    };
};

export const removePlayer = (player) => {
    return async dispatch => {
        await removePlayerFromLobby(player);
        dispatch({
            type: 'REMOVE_PLAYER',
            data: player.uuid
        });
    };
};

export const removeAllPlayersFromState = () => {
    return {
        type: 'REMOVE_ALL_PLAYERS'
    };
};

export const syncPlayers = (players, lobby) => {
    return dispatch => {
        const filterPlayersByLobby = players.filter(p => p.lobbyuuid === lobby.uuid);
        const ids = [filterPlayersByLobby[0].uuid];
        const lobbyPlayers = [filterPlayersByLobby[0]];
        for (let i = 1; i < filterPlayersByLobby.length; i++) {
            if (ids.indexOf(filterPlayersByLobby[i].uuid) === -1) {
                ids.push(filterPlayersByLobby[i].uuid);
                lobbyPlayers.push(filterPlayersByLobby[i]);
            }
        }
        dispatch({
            type: 'SYNC_PLAYERS',
            data: lobbyPlayers
        });
    };
};

export default playersReducer;