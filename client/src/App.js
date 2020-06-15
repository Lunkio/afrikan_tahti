import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { socket } from './index';
import { useSelector, useDispatch } from 'react-redux';
import { initUser } from './reducers/userReducer';
import { newPlayer, editPlayerDetails, removePlayer } from './reducers/playersReducer';
import { setAlert } from './reducers/alertReducer';
import { initLandingSpots, revealLandingSpot } from './reducers/landingSpotReducer';
import { initLandingTokens } from './reducers/landingTokenReducer';
import { initStartPoints } from './reducers/startPointReducer';
import { initLandRoutes } from './reducers/landRouteReducer';
import { initSeaRoutes } from './reducers/seaRouteReducer';
import { foundStar } from './reducers/starIsFoundReducer';
import landingTokenService from './services/landingTokenService';
import AlertMessage from './components/AlertMessage';
import Kartta from './components/Kartta';
import LandingSpot from './components/LandingSpot';
import LandRoute from './components/LandRoute';
import SeaRoute from './components/SeaRoute';
import StartingPoint from './components/StartingPoint';
import LoginPage from './components/LoginPage';
import PlayerView from './components/PlayerView';
import Lobby from './components/Lobby';
import Pawn from './components/Pawn';
import OtherPlayers from './components/OtherPlayers';
import StartingPhase from './components/GamePhases/StartingPhase';
import GamingPhase from './components/GamePhases/GamingPhase';
import GameOver from './components/GamePhases/GameOver';

const App = ({ updater }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const [playersLobbyReady, setPlayersLobbyReady] = useState(false);
    const [playersGameReady, setPlayersGameReady] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Hakee spotit db:stä
    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(initLandingSpots());
                await dispatch(initStartPoints());
                await dispatch(initLandRoutes());
                await dispatch(initSeaRoutes());
                dispatch(initUser());
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('All info was not retrieved from DB'));
            }
        };
        fetch();
    // eslint-disable-next-line
    }, [updater]);

    // kuuntelee serveriä
    useEffect(() => {
        socket.on('tokensAdded', (tokens) => {
            dispatch(initLandingTokens(tokens));
        });

        socket.on('playerJoined', (player) => {
            dispatch(newPlayer(player));
        });

        socket.on('playerRemoved', (player) => {
            dispatch(removePlayer(player));
        });

        socket.on('editedPlayer', (player) => {
            dispatch(editPlayerDetails(player));
        });

        socket.on('landingSpotRevealed', (spot) => {
            dispatch(revealLandingSpot(spot));
        });

        socket.on('starFound', () => {
            dispatch(foundStar());
        });
    // eslint-disable-next-line
    }, []);

    // Menee pelinäkymään kun pelaajat valmiina lobbyssa
    useEffect(() => {
        if (!playersLobbyReady) {
            if (players.length === 0) {
                setPlayersLobbyReady(false);
            } else {
                const allPlayersNotReady = players.find(p => p.lobbyReady === false);
                if (allPlayersNotReady === undefined) {
                    setPlayersLobbyReady(true);
                }
            }
        }
    // eslint-disable-next-line
    }, [players]);

    // Asettaa landingTokenit kartalle ja aloittaa pelin kun pelaajat pelivalmiita, host tuo tokenit muille pelaajille
    useEffect(() => {
        if (!playersGameReady) {
            if (players.length === 0) {
                setPlayersGameReady(false);
            } else {
                const allPlayersNotReady = players.find(p => p.startReady === false);
                if (allPlayersNotReady === undefined) {
                    if (gameOver) {
                        return;
                    }
                    setPlayersGameReady(true);
                    if (!user) {
                        return;
                    }
                    const currentPlayer = players.find(p => p.uuid === user.uuid);
                    if (currentPlayer.host === true) {
                        const getLandingTokens = async () => {
                            try {
                                const tokens = await landingTokenService.getAllLandingTokens();
                                socket.emit('addTokens', tokens);
                            } catch (e) {
                                console.log('error', e);
                                dispatch(setAlert('Tokeneita ei pystytty hakemaan DB:stä =('));
                            }
                        };
                        getLandingTokens();
                    }
                }
            }
        }
    // eslint-disable-next-line
    }, [players]);

    // Julistaa voittajan ja näyttää voitto-ikkunan
    useEffect(() => {
        const thereIsWinner = players.find(p => p.winner === true);
        if (thereIsWinner) {
            setGameOver(true);
        }
    // eslint-disable-next-line
    }, [players]);

    return (
        <div>
            {!user && <LoginPage />}
            {user && !playersLobbyReady && !gameOver && <Lobby gameOver={gameOver} />}
            {user && playersLobbyReady &&
            <div>
                <Centered>
                    <PlayArena>
                        <div>
                            <Kartta />
                            <LandingSpot />
                            <LandRoute />
                            <SeaRoute />
                            <StartingPoint />
                        </div>
                        <PlayerSection>
                            {!playersGameReady && <StartingPhase />}
                            {playersGameReady && <GamingPhase />}
                            <PlayerView />
                            <OtherPlayers />
                        </PlayerSection>
                    </PlayArena>
                    <Pawn />
                </Centered>
            </div>
            }
            {gameOver && <GameOver gameOver={gameOver} setGameOver={setGameOver} setPlayersLobbyReady={setPlayersLobbyReady} setPlayersGameReady={setPlayersGameReady} />}
            <AlertMessage />
        </div>
    );
};

const Centered = styled.div`
    margin: 0;
    position: absolute;
    left: 50%;
    -ms-transform: translateX(-50%);
    transform: translateX(-50%);
`;

const PlayArena = styled.div`
    display: flex;
`;

const PlayerSection = styled.div`
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    width: 100%;
`;

App.propTypes = {
    updater: PropTypes.number
};

export default App;