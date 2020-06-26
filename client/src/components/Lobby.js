import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LobbyManager from './LobbyManager';
import { Button, Container, Typography, Paper } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import lobbyService from '../services/lobbyService';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { syncPlayers } from '../reducers/playersReducer';
import { removePlayerFromLobby } from '../gameUtils';
import { lobbySocket } from '../SocketsLobby';

const Lobby = ({ setPlayerInLobby }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const lobbies = useSelector(state => state.lobbies);
    const [thisLobby, setThisLobby] = useState(undefined);
    const [playersInThisLobby, setPlayersInThisLobby] = useState([players.find(p => p.uuid === user.uuid)]);

    const updateLobbyAndPlayer = async (player) => {
        try {
            const playerToEdit = thisLobby.playersInLobby.find(p => p.uuid === player.uuid);
            playerToEdit.color = player.color;
            playerToEdit.lobbyReady = player.lobbyReady;
            const updatedPlayers = thisLobby.playersInLobby.map(p => p.uuid !== playerToEdit.uuid ? p : playerToEdit);
            thisLobby.playersInLobby = updatedPlayers;
            const updatedLobby = await lobbyService.editLobby(thisLobby);
            lobbySocket.emit('lobbyToEdit', updatedLobby);
            lobbySocket.emit('playerToEdit', player);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni pieleen =('));
        }
    };

    const makePlayerHost = (player) => {
        player.host = true;
        lobbySocket.emit('playerToEdit', player);
    };

    const unHostPlayer = (player) => {
        player.host = false;
        lobbySocket.emit('playerToEdit', player);
    };

    // asettaa thisLobbyn pelaajan tietojen mukaan
    useEffect(() => {
        if (player) {
            setThisLobby(lobbies.find(l => l.uuid === player.lobbyuuid));
        }
    // eslint-disable-next-line
    }, [lobbies]);

    // lisää players stateen uuden liittyneen pelaajan, joka on liittynyt lobbyyn playeria(eli tämä, current) myöhemmin ja tekee lobbyCreatorista hostin
    useEffect(() => {
        if (thisLobby) {
            const playersFromThisLobby = thisLobby.playersInLobby.filter(p => p.lobbyuuid === thisLobby.uuid);
            const allPlayersInThisLobby = [player];
            playersFromThisLobby.forEach((lobbyPlayer) => {
                if (player.uuid !== lobbyPlayer.uuid) {
                    allPlayersInThisLobby.push(lobbyPlayer);
                }
            });
            dispatch(syncPlayers(allPlayersInThisLobby, thisLobby));
        }
        const lobbyCreator = playersInThisLobby.find(p => p.lobbyCreator === true);
        if (lobbyCreator) {
            makePlayerHost(lobbyCreator);
        }
    // eslint-disable-next-line
    }, [thisLobby]);

    //ÄLÄ MUUTA, seuraa pelaajien muutosta ja filtteröi ne pelaajat näkyviin mitkä kuuluvat thisLobbyyn
    useEffect(() => {
        if (thisLobby) {
            setPlayersInThisLobby(players.filter(p => p.lobbyuuid === thisLobby.uuid));
        }
    // eslint-disable-next-line
    }, [players]);

    // tarkastaa että lobbyssa on yksi host, ei enempää ei vähempää
    useEffect(() => {
        if (thisLobby) {
            const playersFromThisLobby = thisLobby.playersInLobby.filter(p => p.lobbyuuid === thisLobby.uuid);
            const thereIsHost = playersFromThisLobby.filter(p => p.host === true);
            if (thereIsHost.length === 0) {
                makePlayerHost(playersFromThisLobby[0]);
            }
            if (thereIsHost.length > 1) {
                for (let i = 1; i < thereIsHost.length; i++) {
                    unHostPlayer(thereIsHost[i]);
                }
            }
        }
    }, [thisLobby]);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    if (!thisLobby) {
        return <LobbyManager />;
    }

    const handleLeaveLobby = () => {
        player.color = '';
        player.inLobby = false;
        player.lobbyReady = false;
        player.lobbyuuid = '';
        player.host = false;
        player.lobbyCreator = false;
        lobbySocket.emit('playerToEdit', player);
        removePlayerFromLobby(player);
        setPlayerInLobby(false);
    };

    const handleColorPick = (color) => {
        const colorNotAvailable = playersInThisLobby.find(p => p.color === color);
        if (colorNotAvailable) {
            dispatch(setAlert('Tämä väri on jo valittu'));
            return;
        }
        if (player.lobbyReady === true) {
            dispatch(setAlert('Olet merkannut itsesi valmiiksi, et voi vaihtaa tällöin väriä'));
            return;
        }
        player.color = color;
        updateLobbyAndPlayer(player);
    };

    const markSelection = (color) => {
        const result = playersInThisLobby.find(p => p.color === color);
        return result ? 'color-selected' : '';
    };

    const playerName = (color) => {
        const player = playersInThisLobby.find(p => p.color === color);
        return player ? player.name : '';
    };

    const playerNameColor = (color) => {
        if (color === '') {
            color = 'white';
        }
        return {color: color, marginRight: '1rem', marginBottom: '5px', textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'};
    };

    const handlePlayerReady = () => {
        if (player.color === 'white' || player.color === '') {
            dispatch(setAlert('Valitsithan värin?'));
            return;
        }
        player.lobbyReady = !player.lobbyReady;
        updateLobbyAndPlayer(player);
    };

    const startGame = async () => {
        try {
            thisLobby.inGame = true;
            const updatedLobby = await lobbyService.editLobby(thisLobby);
            lobbySocket.emit('lobbyToEdit', updatedLobby);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Huoneen pelistatusta ei voitu muuttaa =('));
        }
    };

    const allPlayersReady = () => {
        const allNotReady = playersInThisLobby.find(p => p.lobbyReady === false);
        if (allNotReady) {
            return true;
        } else {
            return false;
        }
    };

    const showReadyIcon = (ready) => {
        return {display: ready ? '' : 'none'};
    };

    const showHostIcon = (host) => {
        return {display: host ? '' : 'none'};
    };

    return (
        <Container maxWidth='md' style={{marginTop: '5rem'}}>
            <LobbyHeader>
                <h1>{thisLobby.name}</h1>
                <Button color='secondary' variant='outlined' onClick={handleLeaveLobby}>
                    Poistu huoneesta
                </Button>
            </LobbyHeader>
            
            <h2>Tervetuloa {user.name}!</h2>
            <div>
                <h4>Valitse väri</h4>
                <ColorPicker>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#7fffd4')} onClick={() => handleColorPick('#7fffd4')} style={{backgroundColor: '#7fffd4'}} />
                        <PlayerName>{playerName('#7fffd4')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#ec1c24')} onClick={() => handleColorPick('#ec1c24')} style={{backgroundColor: '#ec1c24'}} />
                        <PlayerName>{playerName('#ec1c24')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#f900fd')} onClick={() => handleColorPick('#f900fd')} style={{backgroundColor: '#f900fd'}} />
                        <PlayerName>{playerName('#f900fd')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#0ed145')} onClick={() => handleColorPick('#0ed145')} style={{backgroundColor: '#0ed145'}} />
                        <PlayerName>{playerName('#0ed145')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#e4e4e4')} onClick={() => handleColorPick('#e4e4e4')} style={{backgroundColor: '#e4e4e4'}} />
                        <PlayerName>{playerName('#e4e4e4')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#fff200')} onClick={() => handleColorPick('#fff200')} style={{backgroundColor: '#fff200'}} />
                        <PlayerName>{playerName('#fff200')}</PlayerName>
                    </ColorNameContainer>
                </ColorPicker>
            </div>
            <div>
                <Typography variant='h6'>
                    Pelaajat
                </Typography>
                <Paper style={{padding: '1rem'}} elevation={3}>
                    {playersInThisLobby.map(player =>
                        <Typography style={{display: 'flex', alignItems: 'center'}} key={player.uuid}>
                            <span style={playerNameColor(player.color)}>{player.name}</span>
                            <span style={showReadyIcon(player.lobbyReady)}><DoneIcon /></span>
                            <span style={showHostIcon(player.host)}><StarBorderIcon /></span>
                        </Typography>    
                    )}
                </Paper>
            </div>
            <ReadyButtons>
                <Button 
                    variant='outlined'
                    color='primary'
                    onClick={handlePlayerReady}
                >
                    {player.lobbyReady
                        ? 'En olekaan valmis'
                        : 'Valmis'
                    }
                </Button>
                {player.host &&
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={startGame}
                        disabled={allPlayersReady()}
                    >
                        Aloita peli
                    </Button>
                }
            </ReadyButtons>
        </Container>
    );
};

const LobbyHeader = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`;

const ColorPicker = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 50px;
    width: 100%;
`;

const ColorNameContainer = styled.div`
    text-align: center;
    width: 15%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const PlayerColor = styled.div`
    height: 40px;
    width: 40px;
    border-radius: 100%;
    cursor: pointer;
`;

const PlayerName = styled.span`
    word-wrap: break-word;
    width: 100%;
    text-align: center;
`;

const ReadyButtons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

Lobby.propTypes = {
    setPlayerInLobby: PropTypes.func
};

export default Lobby;