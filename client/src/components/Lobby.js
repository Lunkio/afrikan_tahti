import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Button, Container, Typography, Paper } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../reducers/userReducer';
import { setAlert } from '../reducers/alertReducer';
import playersService from '../services/playersService';
import { socket } from '../index';

const Lobby = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);

    useEffect(() => {
        const makePlayerHost = async (player) => {
            try {
                player.host = true;
                const editedPlayer = await playersService.editPlayer(player);
                socket.emit('playerToEdit', editedPlayer);
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Pelaajaa ei voitu asettaa hostiksi =('));
            }
        };
        if (players.length !== 0) {
            const onePlayerIsHost = players.find(p => p.host === true);
            if (!onePlayerIsHost) {
                makePlayerHost(players[0]);
            }
        }
    // eslint-disable-next-line
    }, [players]);

    const handleLogout = async () => {
        try {
            const player = players.find(p => p.uuid === user.uuid);
            await playersService.removeOnePlayer(player);
            socket.emit('removePlayer', player);
            dispatch(logoutUser());
        } catch (e) {
            console.log('error', e);
        }
    };

    const handleColorPick = async (color) => {
        const colorNotAvailable = players.find(p => p.color === color);
        if (colorNotAvailable) {
            dispatch(setAlert('Tämä väri on jo valittu'));
            return;
        }
        try {
            const player = players.find(p => p.uuid === user.uuid);
            if (player.lobbyReady === true) {
                dispatch(setAlert('Olet jo merkannut itsesi valmiiksi, et voi vaihtaa enää väriä'));
                return;
            }
            player.color = color;
            const editedPlayer = await playersService.editPlayer(player);
            socket.emit('playerToEdit', editedPlayer);
        } catch (e) {
            dispatch(setAlert('Jokin meni pieleen =('));
        }
    };

    const markSelection = (color) => {
        const result = players.find(p => p.color === color);
        return result ? 'color-selected' : '';
    };

    const playerName = (color) => {
        const player = players.find(p => p.color === color);
        return player ? player.name : '';
    };

    const playerNameColor = (color) => {
        if (color === '') {
            color = 'white';
        }
        return {color: color, marginRight: '1rem', marginBottom: '5px', textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'};
    };

    const showReadyIcon = (ready) => {
        return {display: ready ? '' : 'none'};
    };

    const handlePlayerReady = async () => {
        try {
            const playerToBeReady = players.find(p => p.uuid === user.uuid);
            if (playerToBeReady.color === 'white' || playerToBeReady.color === '') {
                dispatch(setAlert('Valitsithan värin?'));
                return;
            }
            playerToBeReady.lobbyReady = !playerToBeReady.lobbyReady;
            const playerIsLobbyReady = await playersService.editPlayer(playerToBeReady);
            socket.emit('playerToEdit', playerIsLobbyReady);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni lobbyssa pieleen =('));
        }
    };

    const buttonCheckIfReady = () => {
        const player = players.find(p => p.uuid === user.uuid);
        if (player) {
            return player.lobbyReady;
        } else {
            return false;
        }
    };

    return (
        <Container maxWidth='md' style={{marginTop: '5rem'}}>
            <LobbyHeader>
                <h1>Lobby</h1>
                <Button color='secondary' variant='outlined' onClick={handleLogout}>
                    Poistu
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
                        <PlayerColor className={markSelection('#bd1414')} onClick={() => handleColorPick('#bd1414')} style={{backgroundColor: '#bd1414'}} />
                        <PlayerName>{playerName('#bd1414')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#a748c3')} onClick={() => handleColorPick('#a748c3')} style={{backgroundColor: '#a748c3'}} />
                        <PlayerName>{playerName('#a748c3')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#268b07')} onClick={() => handleColorPick('#268b07')} style={{backgroundColor: '#268b07'}} />
                        <PlayerName>{playerName('#268b07')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#bc752b')} onClick={() => handleColorPick('#bc752b')} style={{backgroundColor: '#bc752b'}} />
                        <PlayerName>{playerName('#bc752b')}</PlayerName>
                    </ColorNameContainer>
                    <ColorNameContainer>
                        <PlayerColor className={markSelection('#e6e600')} onClick={() => handleColorPick('#e6e600')} style={{backgroundColor: '#e6e600'}} />
                        <PlayerName>{playerName('#e6e600')}</PlayerName>
                    </ColorNameContainer>
                </ColorPicker>
            </div>
            <div>
                <Typography variant='h6'>
                    Pelaajat
                </Typography>
                <Paper style={{padding: '1rem'}} elevation={3}>
                    {players.map(player =>
                        <Typography style={{display: 'flex', alignItems: 'center'}} key={player.id}>
                            <span style={playerNameColor(player.color)}>{player.name}</span>
                            <span style={showReadyIcon(player.lobbyReady)}><DoneIcon /></span>
                        </Typography>    
                    )}
                </Paper>
            </div>
            <div style={{marginTop: '1rem'}}>
                <Button 
                    variant='outlined'
                    color='primary'
                    onClick={handlePlayerReady}
                >
                    {buttonCheckIfReady()
                        ? 'En olekaan valmis'
                        : 'Valmis'
                    }
                </Button>
            </div>
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

export default Lobby;