import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import landingTokenService from '../../services/landingTokenService';
import { setAlert } from '../../reducers/alertReducer';
import { gameSocket } from '../../SocketsGame';

const StartingPhase = ({ setPlayerGameReady }) => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);
    const lobbies = useSelector(state => state.lobbies);
    const [thisLobby, setThisLobby] = useState(undefined);
    const [playersInThisLobby, setPlayersInThisLobby] = useState([]);
    // console.log('inGamePlayers', inGamePlayers);
    // console.log('playersInThisLobby', playersInThisLobby);

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
        setThisLobby(lobbies.find(l => l.uuid === player.lobbyuuid));
    // eslint-disable-next-line
    }, []);

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
                }
                setPlayerGameReady(true);
            }
        }
    // eslint-disable-next-line
    }, [playersInThisLobby]);

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
                    : 'Valitse aloituspaikka'
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