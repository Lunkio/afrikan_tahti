const playersReducer = (state = [], action) => {
    switch(action.type) {
    case 'INIT_PLAYERS':
        return action.data;
    case 'NEW_PLAYER':
        return [...state, action.data];
    case 'EDIT_PLAYER_DETAILS':
        return state.map(player => player.id !== action.data.id ? player : action.data);
    case 'REMOVE_PLAYER':
        return state.filter(player => player.id !== action.data);
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
        data: player.id
    };
};

export default playersReducer;