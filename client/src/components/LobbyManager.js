import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Container, Button, TextField, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { v4 as uuid } from 'uuid';
import { removeLobby } from '../reducers/lobbyReducer';
import lobbyService from '../services/lobbyService';
import { lobbySocket } from '../SocketsLobby';

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
        <Container maxWidth='md'>
            {lobbyCreation &&
            <LobbyCreate>
                <form onSubmit={handleNewLobby}>
                    <TextField 
                        autoFocus
                        fullWidth
                        style={{background: 'rgba(255,255,255, 0.7)'}}
                        variant='outlined'
                        size='medium'
                        placeholder='Huoneen nimi'
                        type='text'
                        value={lobbyName}
                        onChange={e => setLobbyName(e.target.value)}
                    />
                    <hr />
                    <Button variant='contained' color='primary' type='submit'>
                        Luo huone
                    </Button>
                </form>
                <CancelButton>
                    <Button onClick={cancelLobbyCreation} color='secondary' variant='contained'>
                        Takaisin
                    </Button>
                </CancelButton>
            </LobbyCreate>
            }
            {defaultView &&
            <LobbiesContainer>
                <CreateLobbyButton>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={createLobby}
                        size='large'
                    >
                        Luo pelihuone
                    </Button>
                </CreateLobbyButton>
                <Lobbies>
                    {lobbies.map(lobby =>
                        <Paper
                            key={lobby.id}
                            variant='elevation'
                            elevation={5}
                            style={{backgroundColor: 'rgba(126,139,255,0.7', width: '48%'}}
                        >
                            <SingeLobby>
                                <LobbyDetails>
                                    <h2>{lobby.name}</h2>
                                    <h5>Pelaajia: {lobby.playersInLobby.length}/6 </h5>
                                </LobbyDetails>
                                <LobbyJoinButton>
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
                                </LobbyJoinButton>
                            </SingeLobby>
                        </Paper>
                    )}
                </Lobbies>
            </LobbiesContainer>
            }
        </Container>
    );
};

const LobbiesContainer = styled.div`
    padding-top: 3rem;
`;

const Lobbies = styled.div`
    display: flex;
    justify-content: space-between;
`;

const SingeLobby = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LobbyDetails = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 70%;
    margin-left: 1rem;
    margin-right: 1rem;
`;

const LobbyJoinButton = styled.div`
    width: 20%;
`;

const CreateLobbyButton = styled.div`
    margin-bottom: 5rem;
`;

const LobbyCreate = styled.div`
    padding-top: 5rem;
`;

const CancelButton = styled.div`
    float: right;
    margin-top: -35px;
`;

LobbyManager.propTypes = {
    setPlayerInLobby: PropTypes.func
};

export default LobbyManager;