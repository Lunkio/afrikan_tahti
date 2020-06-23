import lobbyService from '../services/lobbyService';

const lobbyReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_LOBBIES':
        return action.data;
    case 'NEW_LOBBY':
        return [...state, action.data];
    case 'EDIT_LOBBY_DETAILS':
        return state.map(lobby => lobby.id !== action.data.id ? lobby : action.data);
    case 'REMOVE_LOBBY':
        return state.filter(lobby => lobby.id !== action.data);
    default: return state;
    }
};

export const initLobbies = () => {
    return async dispatch => {
        const lobbies = await lobbyService.getAllLobbies();
        dispatch({
            type: 'INIT_LOBBIES',
            data: lobbies
        });
    };
};

export const addNewLobby = (lobby) => {
    return {
        type: 'NEW_LOBBY',
        data: lobby
    };
};

export const editLobbyDetails = (lobby) => {
    return {
        type: 'EDIT_LOBBY_DETAILS',
        data: lobby
    };
};

export const removeLobby = (lobby) => {
    return {
        type: 'REMOVE_LOBBY',
        data: lobby.id
    };
};

export default lobbyReducer;