import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, Typography } from '@material-ui/core';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import playersService from '../../services/playersService';
import { removeLandingTokens } from '../../reducers/landingTokenReducer';
import { logoutUser } from '../../reducers/userReducer';
import { setAlert } from '../../reducers/alertReducer';
import { socket } from '../../index';

const GameOver = ({ gameOver, setGameOver, setPlayersLobbyReady, setPlayersGameReady }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const [winnerName, setWinnerName] = useState('');

    useEffect(() => {
        const winner = players.find(p => p.winner === true);
        if (winner) {
            dispatch(removeLandingTokens());
            setWinnerName(winner.name);
            players.forEach(async (player) => {
                try {
                    player.lobbyReady = false;
                    player.startReady = false;
                    const editedPlayer = await playersService.editPlayer(player);
                    socket.emit('playerToEdit', editedPlayer);
                } catch (e) {
                    console.log('error', e);
                    dispatch(setAlert('Jokin meni lobby-asetuksissa pieleen =('));
                }
            });
            const unWinPlayer = async (player) => {
                try {
                    player.winner = false;
                    const editedPlayer = await playersService.editPlayer(player);
                    socket.emit('playerToEdit', editedPlayer);
                } catch (e) {
                    console.log('error', e);
                    dispatch(setAlert('Pelaajan voittostatusta ei voitu muuttaa =('));
                }
            };
            unWinPlayer(winner);
        }
    // eslint-disable-next-line
    }, [gameOver]);

    const playerWantsNewGame = async () => {
        const player = players.find(p => p.uuid === user.uuid);
        if (player) {
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
            try {
                const editedPlayer = await playersService.editPlayer(player);
                socket.emit('playerToEdit', editedPlayer);
                setGameOver(false);
                setPlayersLobbyReady(false);
                setPlayersGameReady(false);
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Jokin meni uuden pelin aloittamisessa pieleen =('));
            }
        }
    };

    const playerWantsToLeave = async () => {
        const player = players.find(p => p.uuid === user.uuid);
        if (player) {
            try {
                await playersService.removeOnePlayer(player);
                socket.emit('removePlayer', player);
                dispatch(logoutUser());
                setGameOver(false);
                setPlayersLobbyReady(false);
                setPlayersGameReady(false);
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Jokin meni pelaajan poistamisessa pieleen =('));
            }
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