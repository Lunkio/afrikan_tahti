import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { removeLandingTokens } from '../../reducers/landingTokenReducer';
import { hideLandingSpots } from '../../reducers/landingSpotReducer';
import { logoutUser } from '../../reducers/userReducer';
import { socket } from '../../index';

const GameOver = ({ gameOver, setGameOver, setPlayersLobbyReady, setPlayersGameReady }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const landingSpots = useSelector(state => state.landingSpots);
    const [winnerName, setWinnerName] = useState('');

    useEffect(() => {
        const winner = players.find(p => p.winner === true);
        if (winner) {
            dispatch(removeLandingTokens());
            dispatch(hideLandingSpots(landingSpots));
            setWinnerName(winner.name);
            players.forEach((player) => {
                player.lobbyReady = false;
                player.startReady = false;
                socket.emit('playerToEdit', player);
            });
            const unWinPlayer = (player) => {
                player.winner = false;
                socket.emit('playerToEdit', player);
            };
            unWinPlayer(winner);
        }
    // eslint-disable-next-line
    }, [gameOver]);

    const playerWantsNewGame = () => {
        const player = players.find(p => p.uuid === user.uuid);
        if (player) {
            player.host = false;
            player.color = '';
            player.lobbyReady = false;
            player.startReady = false;
            player.stepControl = 0;
            player.flightControl = 0;
            player.coordX = 0;
            player.coordY = 0;
            player.turnOrder = Math.ceil(Math.random() * 10000000);
            player.canPlay = false;
            player.hasMoved = false;
            player.stepsRemain = 0;
            player.hasFlown = false;
            player.flightTicket = false;
            player.boatTicket = false;
            player.freeBoatTicket = false;
            player.money = 300;
            player.hasWatchedTreasure = false;
            player.hasGambled = false;
            player.hasStar = false;
            player.hasShoe = false;
            player.firstInCapeTown = false;
            player.firstInGoldCoast = false;
            player.winner = false;
            socket.emit('playerToEdit', player);
            setGameOver(false);
            setPlayersLobbyReady(false);
            setPlayersGameReady(false);
        }
    };

    const playerWantsToLeave = () => {
        const player = players.find(p => p.uuid === user.uuid);
        if (player) {
            socket.emit('removePlayer', player);
            dispatch(logoutUser());
            setGameOver(false);
            setPlayersLobbyReady(false);
            setPlayersGameReady(false);
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
    setPlayersLobbyReady: PropTypes.func.isRequired,
    setPlayersGameReady: PropTypes.func.isRequired
};

export default GameOver;