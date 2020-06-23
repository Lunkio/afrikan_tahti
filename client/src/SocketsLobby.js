import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { lobbySocket } from './index';
import { addNewLobby, editLobbyDetails, removeLobby } from './reducers/lobbyReducer';
import { newPlayer, editPlayerDetails, removePlayer } from './reducers/playersReducer';

const SocketsLobby = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        lobbySocket.on('lobbyAdded', (lobby) => {
            dispatch(addNewLobby(lobby));
        });

        lobbySocket.on('lobbyRemoved', (lobby) => {
            dispatch(removeLobby(lobby));
        });

        lobbySocket.on('editedLobby', (lobby) => {
            dispatch(editLobbyDetails(lobby));
        });

        lobbySocket.on('playerJoined', (player) => {
            dispatch(newPlayer(player));
        });

        lobbySocket.on('playerRemoved', (player) => {
            dispatch(removePlayer(player));
        });

        lobbySocket.on('editedPlayer', (player) => {
            dispatch(editPlayerDetails(player));
        });

        return () => lobbySocket.disconnect();
    // eslint-disable-next-line
    }, []);

    return (
        <React.Fragment></React.Fragment>
    );
};

export default SocketsLobby;