import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import tokens from './gameUtils';
import { socket } from './index';
import { useSelector, useDispatch } from 'react-redux';
import { initUser } from './reducers/userReducer';
import { newPlayer, editPlayerDetails, removePlayer } from './reducers/playersReducer';
import { setAlert } from './reducers/alertReducer';
import { initPlayers } from './reducers/playersReducer';
import { initLandingSpots, revealLandingSpot } from './reducers/landingSpotReducer';
import { initLandingTokens } from './reducers/landingTokenReducer';
import { initStartPoints } from './reducers/startPointReducer';
import { initLandRoutes } from './reducers/landRouteReducer';
import { initSeaRoutes } from './reducers/seaRouteReducer';
import { foundStar } from './reducers/starIsFoundReducer';
import mapSpotsService from './services/mapSpotsService';
import playersService from './services/playersService';
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
                //await dispatch(initLandingSpots());
                await dispatch(initStartPoints());
                await dispatch(initLandRoutes());
                await dispatch(initSeaRoutes());
                dispatch(initUser());
                // for dev use these two lines down
                const allPlayersFromDB = await playersService.getAllPlayers();
                dispatch(initPlayers(allPlayersFromDB));
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

    const addTokensToDB = async (tokens) => {
        try {
            await mapSpotsService.removeAllLandingTokens();
            const shuffleTokens = (tokens) => {
                for (let i = tokens.length -1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i +1));
                    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
                }
            };
            shuffleTokens(tokens);
            await mapSpotsService.createLandingTokens(tokens);
        } catch (e) {
            console.log('error', e);
        }
    };

    // Menee pelinäkymään kun pelaajat valmiina lobbyssa ja host-pelaaja luo tokenit peliin
    useEffect(() => {
        if (!playersLobbyReady) {
            if (players.length === 0) {
                setPlayersLobbyReady(false);
            } else {
                const allPlayersNotReady = players.find(p => p.lobbyReady === false);
                if (allPlayersNotReady === undefined) {
                    dispatch(initLandingSpots());
                    setPlayersLobbyReady(true);
                    if (user) {
                        const player = players.find(p => p.uuid === user.uuid);
                        if (player.host) {
                            addTokensToDB(tokens);
                        }
                    }
                }
            }
        }
    // eslint-disable-next-line
    }, [players]);

    // Asettaa landingTokenit kartalle ja aloittaa pelin kun pelaajat pelivalmiita
    useEffect(() => {
        if (!playersGameReady) {
            if (players.length === 0) {
                setPlayersGameReady(false);
            } else {
                const allPlayersReady = players.find(p => p.startReady === false);
                if (allPlayersReady === undefined) {
                    if (gameOver) {
                        return;
                    }
                    setPlayersGameReady(true);
                    dispatch(initLandingTokens());
                }
            }
        }
    // eslint-disable-next-line
    }, [players]);

    // Julistaa voittajan ja näyttää voitto-ikkunan sekä muuttaa tämän jälkeen pelaajan winner statuksen falseksi
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
            {user && !playersLobbyReady && !gameOver && <Lobby />}
            {user && playersLobbyReady &&
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
                    <Pawn />
                </PlayArena>
            }
            {gameOver && <GameOver gameOver={gameOver} setGameOver={setGameOver} setPlayersLobbyReady={setPlayersLobbyReady} setPlayersGameReady={setPlayersGameReady} />}
            <AlertMessage />
        </div>
    );
};

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