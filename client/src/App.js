import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import backgroundImg from './images/background.jpg';
import { useSelector, useDispatch } from 'react-redux';
import { initUser } from './reducers/userReducer';
import { setAlert } from './reducers/alertReducer';
import { initLandingSpots } from './reducers/landingSpotReducer';
import { initStartPoints } from './reducers/startPointReducer';
import { initLandRoutes } from './reducers/landRouteReducer';
import { initSeaRoutes } from './reducers/seaRouteReducer';
import { initLobbies } from './reducers/lobbyReducer';
import { initInGamePlayers } from './reducers/inGamePlayersReducer';
import { removeAllPlayersFromState } from './reducers/playersReducer';
import AlertMessage from './components/AlertMessage';
import Kartta from './components/Kartta';
import LandingSpot from './components/LandingSpot';
import LandRoute from './components/LandRoute';
import SeaRoute from './components/SeaRoute';
import StartingPoint from './components/StartingPoint';
import LoginPage from './components/LoginPage';
import PlayerView from './components/PlayerView';
import LobbyManager from './components/LobbyManager';
import Lobby from './components/Lobby';
import Pawn from './components/Pawn';
import OtherPlayers from './components/OtherPlayers';
import StartingPhase from './components/GamePhases/StartingPhase';
import GamingPhase from './components/GamePhases/GamingPhase';
import GameOver from './components/GamePhases/GameOver';
import BottomPanel from './components/BottomPanel';
import SocketsLobby from './SocketsLobby';
import SocketsGame from './SocketsGame';
import { lobbySocket } from './SocketsLobby';

const App = ({ updater }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const players = useSelector(state => state.players);
    const lobbies = useSelector(state => state.lobbies);
    const [thisLobby, setThisLobby] = useState({});
    const [playerInLobby, setPlayerInLobby] = useState(false);
    const [playerLobbyReady, setPlayerLobbyReady] = useState(false);
    const [playerGameReady, setPlayerGameReady] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [playerLeftFromGame, setPlayerLeftFromGame] = useState({ state: false, player: null });

    // Hakee spotit db:stä
    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(initStartPoints());
                await dispatch(initLandRoutes());
                await dispatch(initSeaRoutes());
                await dispatch(initLobbies());
                dispatch(initUser());
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Virhe tapahtui palvelimen kanssa, yritä myöhemmin uudelleen'));
            }
        };
        fetch();

        // return () => {

        // };
    // eslint-disable-next-line
    }, [updater]);

    // kun pelaaja lähtee pelistä, lobbetSocket aktivoituu vasta kun playerLobbyReady on false, joten lobbySocket.emit tapahtuu vasta tämän jälkeen
    useEffect(() => {
        if (!playerLobbyReady) {
            if (playerLeftFromGame.state) {
                if (playerLeftFromGame.player !== null) {
                    dispatch(initLobbies());
                    setPlayerLeftFromGame({ state: false, player: null });
                    lobbySocket.emit('addPlayer', playerLeftFromGame.player);
                }
            }
        }
    // eslint-disable-next-line
    }, [playerLeftFromGame, playerLobbyReady]);

    // Asettaa pelinäkymän kun pelaajat valmiina lobbyssa, asettaa lobbyn pelaajat uuteen stateen ja antaa thisLobbyn socketille
    useEffect(() => {
        if (!playerLobbyReady) {
            if (players.length !== 0 && user) {
                const player = players.find(p => p.uuid === user.uuid);
                if (player) {
                    const lobby = lobbies.find(l => l.uuid === player.lobbyuuid);
                    if (lobby) {
                        if (lobby.inGame) {
                            setThisLobby(lobby);
                            dispatch(removeAllPlayersFromState());
                            dispatch(initInGamePlayers(lobby.playersInLobby));
                            dispatch(initLandingSpots(lobby));
                            // alla oleva unmountaa SocketsLobby -komponentin
                            setPlayerLobbyReady(true);
                        }
                    }
                }
            }
        }
    // eslint-disable-next-line
    }, [lobbies]);

    return (
        <React.Fragment>
            <Background />
            {!user && <LoginPage />}
            {user && !playerLobbyReady && !gameOver && !playerInLobby && <LobbyManager setPlayerInLobby={setPlayerInLobby} /> }
            {user && !playerLobbyReady && !gameOver && playerInLobby && <Lobby setPlayerInLobby={setPlayerInLobby} />}
            {user && playerLobbyReady &&
            <Centered>
                <PlayArena>
                    <div>
                        <Kartta />
                        <BottomPanel setPlayerLeftFromGame={setPlayerLeftFromGame} setPlayerLobbyReady={setPlayerLobbyReady} setPlayerInLobby={setPlayerInLobby} setPlayerGameReady={setPlayerGameReady} />
                        <LandingSpot />
                        <LandRoute />
                        <SeaRoute />
                        <StartingPoint />
                    </div>
                    <PlayerSection>
                        {!playerGameReady && <StartingPhase setPlayerGameReady={setPlayerGameReady} />}
                        {playerGameReady && <GamingPhase />}
                        <PlayerView />
                        <OtherPlayers />
                    </PlayerSection>
                </PlayArena>
                <Pawn />
            </Centered>
            }
            {gameOver && 
                <GameOver gameOver={gameOver}
                    setGameOver={setGameOver}
                    setPlayerInLobby={setPlayerInLobby}
                    setPlayerLobbyReady={setPlayerLobbyReady}
                    setPlayerGameReady={setPlayerGameReady}
                />}
            <AlertMessage />
            {!playerLobbyReady && <SocketsLobby /> }
            {playerLobbyReady && <SocketsGame thisLobby={thisLobby} setGameOver={setGameOver} /> }
        </React.Fragment>
    );
};

const Background = styled.div`
    background: url(${backgroundImg}) no-repeat center center fixed;
    position: absolute;
    height: 100%;
    width: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -100;
    /* filter: blur(8px);
    -webkit-filter: blur(8px); */
`;

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