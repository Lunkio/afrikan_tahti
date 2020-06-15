const playersReducer = (state = [], action) => {
    switch(action.type) {
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
    default: return state;
    }
};

export const initPlayers = (players) => {
    return {
        type: 'INIT_PLAYERS',
        data: players
    };
};

export const newPlayer = (newPlayer) => {
    return {
        type: 'NEW_PLAYER',
        data: newPlayer
    };
};

export const editPlayerDetails = (player) => {
    return {
        type: 'EDIT_PLAYER_DETAILS',
        data: player
    };
};

export const removePlayer = (player) => {
    return {
        type: 'REMOVE_PLAYER',
        data: player.uuid
    };
};

export const removeAllPlayersFromState = () => {
    return {
        type: 'REMOVE_ALL_PLAYERS'
    };
};

export default playersReducer;