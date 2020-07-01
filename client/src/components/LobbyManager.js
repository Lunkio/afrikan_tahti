import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useStyles } from '../styles/styles';
import { Container, Button, TextField, Paper, Grid, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { v4 as uuid } from 'uuid';
import { removeLobby } from '../reducers/lobbyReducer';
import lobbyService from '../services/lobbyService';
import { lobbySocket } from '../SocketsLobby';

const LobbyManager = ({ setPlayerInLobby }) => {
    const classes = useStyles();
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
        if (lobby.playersInLobby.length === 6) {
            dispatch(setAlert('Huone on täynnä'));
            return;
        }
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
            <WelcomeText>
                <Typography variant='h3'>
                    Tervetuloa <NameStyle>{player.name}</NameStyle>!
                </Typography>
            </WelcomeText>
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
                <LobbiesHeader>
                    <Header variant='h3'>
                        Huoneet:
                    </Header>
                    <div>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={createLobby}
                            size='large'
                        >
                            Luo pelihuone
                        </Button>
                    </div>
                </LobbiesHeader>
                {lobbies.length === 0 && 
                <NoLobbies>
                    <Typography variant='h5'>
                        Ei huoneita...
                    </Typography>
                </NoLobbies>
                }
                {lobbies.length > 0 &&
                <StyledGrid container spacing={3} className='styled-grid'>
                    {lobbies.map(lobby =>
                        <Grid item xs={6} key={lobby.id}>
                            <StyledPaper
                                variant='elevation'
                                elevation={5}
                            >
                                <SingeLobby>
                                    <LobbyHeader>
                                        <LobbyName>
                                            <h2>{lobby.name}</h2>
                                        </LobbyName>
                                        <div>
                                            <Button
                                                variant='contained'
                                                onClick={() => joinLobby(lobby)}
                                                disabled={lobby.inGame}
                                                className={classes.yellowButton}
                                            >
                                                {lobby.inGame
                                                    ? 'Peli käynnissä'
                                                    : 'Liity'
                                                }
                                            </Button>
                                        </div>
                                    </LobbyHeader>
                                    <Divider />
                                    <LobbyPlayers>
                                        <h5 style={{color: '#FC9E4F'}} >Pelaajia: {lobby.playersInLobby.length}/6</h5>
                                        <ListGrid container>
                                            {lobby.playersInLobby.map(player => 
                                                <ListPlayer item xs={4} key={player.uuid}>
                                                    {player.name}
                                                </ListPlayer>
                                            )}
                                        </ListGrid>
                                    </LobbyPlayers>
                                </SingeLobby>
                            </StyledPaper>
                        </Grid>
                    )}
                </StyledGrid>
                }
            </LobbiesContainer>
            }
        </Container>
    );
};

const WelcomeText = styled.div`
    text-align: center;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    color: #5065e0;
    margin-top: 2rem;
`;

const NameStyle = styled.span`
    color: #FC9E4F;
`;

const LobbiesContainer = styled.div`
    padding-top: 3rem;
`;

const Header = styled(Typography)`
    color: #DEEAF7;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
`;

const LobbiesHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const NoLobbies = styled.div`
    text-align: center;
    color: #FC9E4F;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    background-color: rgba(85,70,64,0.3);
    padding: 1rem;
`;

const StyledGrid = styled(Grid)`
    height: 40rem;
    overflow: scroll;
    scrollbar-width: none;
    background-color: rgba(85,70,64,0.3) !important;
    padding: 1rem;
    border-radius: 1%;
`;

const StyledPaper = styled(Paper)`
    color: #DEEAF7 !important;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    background-color: rgba(63,80,181,0.9) !important;
`;

const SingeLobby = styled.div`
    margin-left: 1rem;
    margin-right: 1rem;
`;

const LobbyHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LobbyName = styled.div`
    width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Divider = styled.hr`
    margin-top: -0.5rem;
    margin-bottom: -0.3rem;
`;

const LobbyPlayers = styled.div`
    display: flex;
    margin-top: 0.5rem;
`;

const ListGrid = styled(Grid)`
    width: 70% !important;
    justify-content: space-between;
    align-items: center;
    margin-left: 2rem;
`;

const ListPlayer = styled(Grid)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-basis: 28.33% !important;
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