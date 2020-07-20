import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { removeLandingTokens } from '../../reducers/landingTokenReducer';
import { hideLandingSpots } from '../../reducers/landingSpotReducer';
import { removeAllInGamePlayersFromState } from '../../reducers/inGamePlayersReducer';
import { removePlayerFromLobby, setDefaultPlayerProperties, updateLobbyAndPlayer } from '../../gameUtils';
import { setAlert } from '../../reducers/alertReducer';
import lobbyService from '../../services/lobbyService';
import { lobbySocket } from '../../SocketsLobby';

const GameOver = ({ gameOver, setGameOver, setPlayerInLobby, setPlayerLobbyReady, setPlayerGameReady }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const lobbies = useSelector(state => state.lobbies);
    const players = useSelector(state => state.players);
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const landingSpots = useSelector(state => state.landingSpots);
    const [winnerName, setWinnerName] = useState('');
    const [newGame, setNewGame] = useState(false);

    useEffect(() => {
        const winner = inGamePlayers.find(p => p.winner === true);
        if (winner) {
            setWinnerName(winner.name);
            setPlayerLobbyReady(false);
            setPlayerGameReady(false);
            dispatch(removeLandingTokens());
            dispatch(hideLandingSpots(landingSpots));
        }
    // eslint-disable-next-line
    }, [gameOver]);

    // tämä odottaa kunnes lobbySocketin addPlayer on toteunut ensin ja sitten vasta asetetaan gameOver falseksi, jolloinka lobby komponentti näyttää playersit oikein
    useEffect(() => {
        if (newGame) {
            const player = players.find(p => p.uuid === user.uuid);
            if (player) {
                setNewGame(false);
                setGameOver(false);
            }
        }
    // eslint-disable-next-line
    }, [newGame, players]);

    const setLobbyInGameToFalse = async (player, lobby) => {
        try {
            const thisLobby = await lobbyService.getSingleLobby(lobby);
            if (thisLobby) {
                if (thisLobby.inGame) {
                    thisLobby.inGame = false;
                    updateLobbyAndPlayer(player, thisLobby, 'gameOverComponent');
                } else {
                    updateLobbyAndPlayer(player, thisLobby, 'gameOverComponent');
                }
            }
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni pieleen =('));
        }
    };

    const playerWantsNewGame = () => {
        const player = inGamePlayers.find(p => p.uuid === user.uuid);
        if (player) {
            setDefaultPlayerProperties(player, 'notLeaving');
            const thisLobby = lobbies.find(l => l.uuid === player.lobbyuuid);
            if (thisLobby) {
                setLobbyInGameToFalse(player, thisLobby);
            }
            dispatch(removeAllInGamePlayersFromState());
            lobbySocket.emit('addPlayer', player);
            setNewGame(true);
        }
    };

    const playerWantsToLeave = () => {
        const player = inGamePlayers.find(p => p.uuid === user.uuid);
        if (player) {
            removePlayerFromLobby(player, 'lobbySocketIsActivated');
            setDefaultPlayerProperties(player, 'leaving');
            dispatch(removeAllInGamePlayersFromState());
            setGameOver(false);
            setPlayerInLobby(false);
            lobbySocket.emit('addPlayer', player);
        }
    };

    return (
        <Modal className='modal-container'>
            <CenterModal>
                <Card style={{width: '300px'}} variant="outlined">
                    <CardContent>
                        <Typography variant='h5'>
                            {winnerName} voitti pelin!
                        </Typography>
                    </CardContent>
                    <CenterButtons>
                        <Button onClick={playerWantsNewGame} color='primary' variant='contained' size='small'>Uusi peli</Button>
                        <Button onClick={playerWantsToLeave} color='secondary' variant='contained' size='small'>Lopeta</Button>
                    </CenterButtons>
                </Card>
            </CenterModal>
        </Modal>
    );
};

const Modal = styled.div`
    position: fixed;
    z-index: 9000;
    text-align: center;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;  /* Enables scroll */
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.8);
`;

const CenterModal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const CenterButtons = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 1rem;
`;

GameOver.propTypes = {
    gameOver: PropTypes.bool.isRequired,
    setGameOver: PropTypes.func.isRequired,
    setPlayerInLobby: PropTypes.func.isRequired,
    setPlayerLobbyReady: PropTypes.func.isRequired,
    setPlayerGameReady: PropTypes.func.isRequired
};

export default GameOver;