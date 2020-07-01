import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useStyles } from '../styles/styles';
import LobbyManager from './LobbyManager';
import { Button, Container, Typography, Paper } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import StarIcon from '@material-ui/icons/Star';
import lobbyService from '../services/lobbyService';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { syncPlayers } from '../reducers/playersReducer';
import { removePlayerFromLobby, updateLobbyAndPlayer } from '../gameUtils';
import { lobbySocket } from '../SocketsLobby';

const Lobby = ({ setPlayerInLobby }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const lobbies = useSelector(state => state.lobbies);
    const [thisLobby, setThisLobby] = useState(undefined);
    const [playersInThisLobby, setPlayersInThisLobby] = useState([players.find(p => p.uuid === user.uuid)]);

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
            const allPlayersInThisLobby = [player];
            const playersFromThisLobby = thisLobby.playersInLobby.filter(p => p.lobbyuuid === thisLobby.uuid);
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
        updateLobbyAndPlayer(player, thisLobby, 'lobbyComponent');
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
            color = '#DEEAF7';
        }
        return {color: color, marginRight: '1rem', marginBottom: '5px', textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'};
    };

    const handlePlayerReady = () => {
        if (player.color === '#DEEAF7' || player.color === '') {
            dispatch(setAlert('Valitsithan värin?'));
            return;
        }
        player.lobbyReady = !player.lobbyReady;
        updateLobbyAndPlayer(player, thisLobby, 'lobbyComponent');
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
        <Container maxWidth='md' style={{paddingTop: '3rem'}} >
            <LobbyContainer>
                <LobbyHeader>
                    <Typography variant='h4'>
                        {thisLobby.name}
                    </Typography>
                </LobbyHeader>
                <LobbyDetails>
                    <TypographyStyle variant='h5'>
                        Valitse väri
                    </TypographyStyle>
                    <Button color='secondary' variant='contained' onClick={handleLeaveLobby}>
                        Poistu huoneesta
                    </Button>
                </LobbyDetails>
                <div>
                    <ColorPicker>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#7fffd4')} onClick={() => handleColorPick('#7fffd4')} style={{backgroundColor: '#7fffd4', border: '2px solid black'}} />
                            <PlayerName>{playerName('#7fffd4')}</PlayerName>
                        </ColorNameContainer>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#ec1c24')} onClick={() => handleColorPick('#ec1c24')} style={{backgroundColor: '#ec1c24', border: '2px solid black'}} />
                            <PlayerName>{playerName('#ec1c24')}</PlayerName>
                        </ColorNameContainer>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#f900fd')} onClick={() => handleColorPick('#f900fd')} style={{backgroundColor: '#f900fd', border: '2px solid black'}} />
                            <PlayerName>{playerName('#f900fd')}</PlayerName>
                        </ColorNameContainer>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#0ed145')} onClick={() => handleColorPick('#0ed145')} style={{backgroundColor: '#0ed145', border: '2px solid black'}} />
                            <PlayerName>{playerName('#0ed145')}</PlayerName>
                        </ColorNameContainer>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#b97a56')} onClick={() => handleColorPick('#b97a56')} style={{backgroundColor: '#b97a56', border: '2px solid black'}} />
                            <PlayerName>{playerName('#b97a56')}</PlayerName>
                        </ColorNameContainer>
                        <ColorNameContainer>
                            <PlayerColor className={markSelection('#fff200')} onClick={() => handleColorPick('#fff200')} style={{backgroundColor: '#fff200', border: '2px solid black'}} />
                            <PlayerName>{playerName('#fff200')}</PlayerName>
                        </ColorNameContainer>
                    </ColorPicker>
                </div>
                <div>
                    <TypographyStyle variant='h6'>
                        Pelaajat
                    </TypographyStyle>
                    <StyledPaper elevation={3}>
                        {playersInThisLobby.map((player, index) =>
                            <Players key={index}>
                                <PlayerNameLobby style={playerNameColor(player.color)}>{player.name}</PlayerNameLobby>
                                <IconColor style={showReadyIcon(player.lobbyReady)}><DoneIcon /></IconColor>
                                <IconColor style={showHostIcon(player.host)}><StarIcon /></IconColor>
                            </Players>    
                        )}
                    </StyledPaper>
                </div>
                <ReadyButtons>
                    <Button 
                        variant='contained'
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
                            className={classes.yellowButton}
                            variant='contained'
                            onClick={startGame}
                            disabled={allPlayersReady()}
                        >
                            Aloita peli
                        </Button>
                    }
                </ReadyButtons>
            </LobbyContainer>
        </Container>
    );
};

const LobbyContainer = styled.div`
    padding: 1rem;
    background-color: rgba(85,70,64,0.3);
    border-radius: 1%;
`;

const LobbyHeader = styled.div`
    padding-top: 0.1rem;
    text-align: center;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    color: #FC9E4F;
`;

const TypographyStyle = styled(Typography)`
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    color: #DEEAF7;
`;

const LobbyDetails = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ColorPicker = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    margin-top: 1rem;
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
    color: #DEEAF7;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    word-wrap: break-word;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StyledPaper = styled(Paper)`
    background-color: rgba(63,80,181,0.9) !important;
    padding: 1rem;
`;

const PlayerNameLobby = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Players = styled(Typography)`
    display: flex;
    align-items: center;
`;

const IconColor = styled.span`
    color: #DEEAF7;
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