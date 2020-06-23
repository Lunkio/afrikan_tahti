import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Button, TextField } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { v4 as uuid } from 'uuid';
import { removeLobby } from '../reducers/lobbyReducer';
import lobbyService from '../services/lobbyService';
import { lobbySocket } from '../index';

const LobbyManager = ({ setPlayerInLobby }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const lobbies = useSelector(state => state.lobbies);
    const [lobbyName, setLobbyName] = useState('');
    const [defaultView, setDefaultView] = useState(true);
    const [lobbyCreation, setLobbyCreation] = useState(false);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const createLobby = () => {
        setLobbyCreation(true);
        setDefaultView(false);
    };

    const cancelLobbyCreation = () => {
        setLobbyCreation(false);
        setDefaultView(true);
    };

    const handleNewLobby = async (event) => {
        event.preventDefault();
        try {
            if (lobbyName === '') {
                dispatch(setAlert('Huone tarvitsee nimen'));
                return;
            }
            const id = uuid();
            player.inLobby = true;
            player.lobbyuuid = id;
            const newLobby = {
                name: lobbyName,
                inGame: false,
                playersInLobby: [player],
                uuid: id
            };
            const savedLobby = await lobbyService.createLobby(newLobby);
            player.lobbyCreator = true;
            lobbySocket.emit('addLobby', savedLobby);
            lobbySocket.emit('playerToEdit', player);
            setLobbyName('');
            setPlayerInLobby(true);
        } catch (e) {
            player.inLobby = false;
            player.lobbyuuid = '';
            player.lobbyCreator = false;
            console.log('error', e);
            dispatch(setAlert('Tämän niminen huone on jo luotu'));
        }
    };

    const joinLobby = async (lobby) => {
        try {
            player.inLobby = true;
            player.lobbyuuid = lobby.uuid;
            lobby.playersInLobby.push(player);
            const updatedLobby = await lobbyService.editLobby(lobby);
            lobbySocket.emit('lobbyToEdit', updatedLobby);
            lobbySocket.emit('playerToEdit', player);
            setPlayerInLobby(true);
        } catch (e) {
            player.inLobby = false;
            player.lobbyuuid = '';
            console.log('error', e);
            dispatch(setAlert('Huone on jo poistettu'));
            dispatch(removeLobby(lobby));
        }
    };

    return (
        <Container maxWidth='md' style={{marginTop: '5rem'}}>
            {lobbyCreation &&
            <div>
                <form onSubmit={handleNewLobby}>
                    <TextField 
                        autoFocus
                        fullWidth
                        variant='outlined'
                        size='medium'
                        placeholder='Huoneen nimi'
                        type='text'
                        value={lobbyName}
                        onChange={e => setLobbyName(e.target.value)}
                    />
                    <hr />
                    <Button variant='outlined' color='primary' type='submit'>
                        Luo huone
                    </Button>
                </form>
                <Button onClick={cancelLobbyCreation} color='secondary' variant='contained'>
                    Peru
                </Button>
            </div>
            }
            {defaultView &&
            <div>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={createLobby}
                >
                    Luo pelihuone
                </Button>
                {lobbies.map(lobby =>
                    <div key={lobby.id}>
                        {lobby.name}
                        <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => joinLobby(lobby)}
                            disabled={lobby.inGame}
                        >
                            {lobby.inGame
                                ? 'Peli käynnissä'
                                : 'Liity'
                            }
                        </Button>
                    </div>
                )}
            </div>
            }
        </Container>
    );
};

LobbyManager.propTypes = {
    setPlayerInLobby: PropTypes.func
};

export default LobbyManager;