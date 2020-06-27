import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNewLobby, editLobbyDetails, removeLobby } from './reducers/lobbyReducer';
import { newPlayer, editPlayerDetails, removePlayer } from './reducers/playersReducer';

export let lobbySocket;

const SocketsLobby = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // eslint-disable-next-line
        if (process.env.NODE_ENV === 'development') {
            lobbySocket = io(':3001');
        } else {
            lobbySocket = io('https://afrikan-tahti.herokuapp.com/');
        }

        lobbySocket.on('lobbyAdded', (lobby) => {
            dispatch(addNewLobby(lobby));
        });

        lobbySocket.on('lobbyRemoved', (lobby) => {
            dispatch(removeLobby(lobby));
        });

        lobbySocket.on('editedLobby', (lobby) => {
            //console.log('SOCKET, editedLobby', lobby);
            dispatch(editLobbyDetails(lobby));
        });

        lobbySocket.on('playerAdded', (player) => {
            //console.log('playerAdded SOCKET', player);
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