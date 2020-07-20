import React, { useEffect } from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { revealLandingSpot } from './reducers/landingSpotReducer';
import { foundStar } from './reducers/starIsFoundReducer';
import { initLandingTokens } from './reducers/landingTokenReducer';
import { editInGamePlayer, editInGamePlayersAll, removeInGamePlayer, removeInGamePlayerAndFromLobby } from './reducers/inGamePlayersReducer';
import { setTimer } from './reducers/timerReducer';
import { throwDice } from './reducers/diceReducer';

export let gameSocket;

const SocketsGame = ({ thisLobby, setGameOver }) => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);

    useEffect(() => {
        // eslint-disable-next-line
        if (process.env.NODE_ENV === 'development') {
            gameSocket = io(':3001');
        } else {
            gameSocket = io('https://afrikan-tahti.herokuapp.com/');
        }

        gameSocket.on('tokensAdded', (tokens, lobby) => {
            if (Object.prototype.hasOwnProperty.call(thisLobby, 'uuid')) {
                if (lobby.id === thisLobby.id) {
                    dispatch(initLandingTokens(tokens));
                }
            }
        });

        gameSocket.on('landingSpotRevealed', (spot) => {
            if (Object.prototype.hasOwnProperty.call(thisLobby, 'uuid')) {
                if (spot.lobbyId === thisLobby.id) {
                    dispatch(revealLandingSpot(spot));
                }
            }
        });

        gameSocket.on('thrownDice', (player, amount) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, nopan heitto tulee tänne');
                dispatch(throwDice(amount));
            }
        });

        gameSocket.on('inGameEditedPlayer', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, pelaajan muokkaus tulee tänne');
                dispatch(editInGamePlayer(player));
                if (player.winner) {
                    setGameOver(true);
                }
            }
        });

        gameSocket.on('inGamePlayersEditedTurn', (players) => {
            if (inGamePlayers.find(p => p.uuid === players[0].uuid)) {
                //console.log('SOCKET, pelaajan lähtö tulee tänne');
                dispatch(editInGamePlayersAll(players));
            }
        });

        gameSocket.on('inGamePlayerRemoved', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, pelaajan lähtö tulee tänne');
                dispatch(removeInGamePlayer(player));
            }
        });

        gameSocket.on('inGamePlayerRemovedAndFromLobby', (player) => {
            //console.log('gameSocket inGamePlayerRemovedAndFromLobby', player);
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, pelaajan lähtö tulee tänne');
                dispatch(removeInGamePlayerAndFromLobby(player));
            }
        });

        gameSocket.on('starFound', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, tähden löytö tulee tänne');
                dispatch(foundStar());
            }
        });

        gameSocket.on('counterSet', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                //console.log('SOCKET, vuoron vaihto tulee tänne');
                dispatch(setTimer(player));
            }
        });

        return () => gameSocket.disconnect();
    // eslint-disable-next-line
    }, []);

    return (
        <React.Fragment></React.Fragment>
    );
};

SocketsGame.propTypes = {
    thisLobby: PropTypes.object,
    setGameOver: PropTypes.func
};

export default SocketsGame;