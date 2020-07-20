import { removePlayerFromLobby } from '../gameUtils';

const inGamePlayersReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_INGAMEPLAYERS':
        return action.data;
    case 'EDIT_INGAMEPLAYER':
        return state.map(player => player.uuid !== action.data.uuid ? player : action.data);
    case 'EDIT_INGAMEPLAYER_ALL':
        return action.data;
    case 'REMOVE_INGAMEPLAYER':
        return state.filter(player => player.uuid !== action.data);
    case 'REMOVE_ALL_INGAMEPLAYERS':
        return [];
    default: return state;
    }
};

export const initInGamePlayers = (players) => {
    return {
        type: 'INIT_INGAMEPLAYERS',
        data: players
    };
};

export const editInGamePlayer = (player) => {
    return {
        type: 'EDIT_INGAMEPLAYER',
        data: player
    };
};

export const editInGamePlayersAll = (players) => {
    return {
        type: 'EDIT_INGAMEPLAYER_ALL',
        data: players
    };
};

export const removeInGamePlayer = (player) => {
    return {
        type: 'REMOVE_INGAMEPLAYER',
        data: player.uuid
    };
};

export const removeInGamePlayerAndFromLobby = (player) => {
    return async dispatch => {
        await removePlayerFromLobby(player, 'none');
        dispatch({
            type: 'REMOVE_INGAMEPLAYER',
            data: player.uuid
        });
    };
};

export const removeAllInGamePlayersFromState = () => {
    return {
        type: 'REMOVE_ALL_INGAMEPLAYERS'
    };
};

export default inGamePlayersReducer;