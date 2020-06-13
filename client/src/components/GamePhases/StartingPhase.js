import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { setAlert } from '../../reducers/alertReducer';
import playersService from '../../services/playersService';
import { socket } from '../../index';

const StartingPhase = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const playerStartReady = async () => {
        try {
            if (player.stepControl === 0) {
                dispatch(setAlert('Valitse aloituspaikka'));
                return;
            }
            player.startReady = !player.startReady;
            const playerIsStartReady = await playersService.editPlayer(player);
            socket.emit('playerToEdit', playerIsStartReady);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni aloituksessa pieleen'));
        }
    };

    const startInfoText = () => {
        return player.startReady ? 'Odota muita pelaajia...' : 'Valitse aloituspaikka';
    };

    const buttonCheckIfReady = () => {
        if (player) {
            return player.startReady;
        } else {
            return false;
        }
    };

    return (
        <div>
            <h3>
                {startInfoText()}
            </h3>
            <Button onClick={playerStartReady} color='primary' variant='contained'>
                {buttonCheckIfReady()
                    ? 'Vaihdankin aloituspaikkaa'
                    : 'Valmis'
                }
            </Button>
        </div>
    );
};

export default StartingPhase;

