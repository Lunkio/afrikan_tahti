import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Container, Typography, Paper } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../reducers/userReducer';
import { setAlert } from '../reducers/alertReducer';
import { socket } from '../index';

const Lobby = ({ gameOver }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);

    useEffect(() => {
        const makePlayerHost = (player) => {
            player.host = true;
            socket.emit('playerToEdit', player);
        };
        if (players.length !== 0) {
            const onePlayerIsHost = players.find(p => p.host === true);
            if (!onePlayerIsHost) {
                makePlayerHost(players[0]);
            }
        }
    // eslint-disable-next-line
    }, [players, gameOver]);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const handleLogout = () => {
        socket.emit('removePlayer', player);
        dispatch(logoutUser());
    };

    const handleColorPick = (color) => {
        const colorNotAvailable = players.find(p => p.color === color);
        if (colorNotAvailable) {
            dispatch(setAlert('Tämä väri on jo valittu'));
            return;
        }
        if (player.lobbyReady === true) {
            dispatch(setAlert('Olet jo merkannut itsesi valmiiksi, et voi vaihtaa enää väriä'));
            return;
        }
        player.color = color;
        socket.emit('playerToEdit', player);
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

    const handlePlayerReady = () => {
        if (player.color === 'white' || player.color === '') {
            dispatch(setAlert('Valitsithan värin?'));
            return;
        }
        player.lobbyReady = !player.lobbyReady;
        socket.emit('playerToEdit', player);
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
                    {players.map(player =>
                        <Typography style={{display: 'flex', alignItems: 'center'}} key={player.uuid}>
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
                    {player.lobbyReady
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

Lobby.propTypes = {
    gameOver: PropTypes.bool.isRequired
};

export default Lobby;