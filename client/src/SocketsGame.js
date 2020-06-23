import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { gameSocket } from './index';
import { revealLandingSpot } from './reducers/landingSpotReducer';
import { foundStar } from './reducers/starIsFoundReducer';
import { initLandingTokens } from './reducers/landingTokenReducer';
import { editInGamePlayer } from './reducers/inGamePlayersReducer';

const SocketsGame = ({ thisLobby, setGameOver }) => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);

    useEffect(() => {
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

        gameSocket.on('inGameEditedPlayer', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                console.log('SOCKET, pelaajan muokkaus tulee tänne');
                dispatch(editInGamePlayer(player));
                if (player.winner) {
                    setGameOver(true);
                }
            }
        });

        gameSocket.on('starFound', (player) => {
            if (inGamePlayers.find(p => p.uuid === player.uuid)) {
                console.log('SOCKET, tähden löytö tulee tänne');
                dispatch(foundStar());
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