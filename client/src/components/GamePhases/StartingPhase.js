import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { setAlert } from '../../reducers/alertReducer';
import { socket } from '../../index';

const StartingPhase = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const playerStartReady = () => {
        if (player.stepControl === 0) {
            dispatch(setAlert('Valitse aloituspaikka'));
            return;
        }
        player.startReady = !player.startReady;
        socket.emit('playerToEdit', player);
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

export default StartingPhase;

