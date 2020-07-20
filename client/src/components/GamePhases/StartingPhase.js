import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import landingTokenService from '../../services/landingTokenService';
import lobbyService from '../../services/lobbyService';
import { setAlert } from '../../reducers/alertReducer';
import { gameSocket } from '../../SocketsGame';

const StartingPhase = ({ setPlayerGameReady }) => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);
    const lobbies = useSelector(state => state.lobbies);
    const [thisLobby, setThisLobby] = useState(undefined);
    const [playersInThisLobby, setPlayersInThisLobby] = useState([]);

    const getLandingTokens = async (lobby) => {
        try {
            const tokens = await landingTokenService.getAllLandingTokens();
            gameSocket.emit('addTokens', tokens, lobby);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Tokeneita ei pystytty hakemaan =('));
        }
    };

    const makePlayerHost = (player) => {
        player.host = true;
        gameSocket.emit('inGamePlayerToEdit', player);
    };

    // hakee oikean lobbyn
    useEffect(() => {
        if (player) {
            setThisLobby(lobbies.find(l => l.uuid === player.lobbyuuid));
        }
    // eslint-disable-next-line
    }, []);

    // päivittää pelaajan socketId:n koska SocketsGame -komponentin mounttaus vaihtoi id:n
    useEffect(() => {
        if (gameSocket && player) {
            gameSocket.emit('updatePlayerSocketId', player);
            console.log('gameSocket, pitäisi näkyä vain kerran', gameSocket);
        }
    // eslint-disable-next-line
    }, [gameSocket]);

    useEffect(() => {
        if (thisLobby) {
            setPlayersInThisLobby(inGamePlayers.filter(p => p.lobbyuuid === thisLobby.uuid));
        }
    // eslint-disable-next-line
    }, [inGamePlayers]);

    // hakee hostin, jos ei ole niin tekee listan ekasta pelaajasta hostin
    useEffect(() => {
        if (playersInThisLobby.length !== 0) {
            const thereIsHost = playersInThisLobby.find(p => p.host === true);
            if (!thereIsHost) {
                makePlayerHost(playersInThisLobby[0]);
            }
        }
    }, [playersInThisLobby]);

    // tarkistaa ovatko kaikki pelaajat valmiita, jos on niin host tuo tokenit
    useEffect(() => {
        if (thisLobby && playersInThisLobby.length !== 0) {
            const allPlayersNotReady = playersInThisLobby.find(p => p.startReady === false);
            if (allPlayersNotReady === undefined) {
                if (player.host) {
                    getLandingTokens(thisLobby);
                    setsLobbyReadyToFalseFromPlayersInThisLobby(thisLobby);
                }
                setPlayerGameReady(true);
            }
        }
    // eslint-disable-next-line
    }, [playersInThisLobby]);

    const setsLobbyReadyToFalseFromPlayersInThisLobby = async (lobby) => {
        try {
            const thisLobby = await lobbyService.getSingleLobby(lobby);
            if (thisLobby) {
                const playersFromLobby = thisLobby.playersInLobby;
                playersFromLobby.forEach(player => {
                    player.lobbyReady = false;
                    player.color = '';
                });
                thisLobby.playersInLobby = playersFromLobby;
                await lobbyService.editLobby(thisLobby);
            }
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni pieleen =('));
        }
    };

    const player = inGamePlayers.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const playerStartReady = () => {
        if (player.stepControl === 0) {
            dispatch(setAlert('Valitse aloituspaikka'));
            return;
        }
        player.startReady = !player.startReady;
        gameSocket.emit('inGamePlayerToEdit', player);
    };

    return (
        <div>
            <h3>
                {player.startReady
                    ? 'Odota muita pelaajia...'
                    : 'Valitse aloituspaikka ja klikkaa "Valmis"'
                }
            </h3>
            <Button onClick={playerStartReady} color='primary' variant='contained'>
                {player.startReady
                    ? 'Vaihdankin aloituspaikkaa'
                    : 'Valmis'
                }
            </Button>
        </div>
    );
};

StartingPhase.propTypes = {
    setPlayerGameReady: PropTypes.func.isRequired
};

export default StartingPhase;