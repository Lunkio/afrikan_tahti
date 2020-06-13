import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import playersService from '../services/playersService';
import { socket } from '../index';

export const movePawn = async (spot, player) => {
    try {
        player.coordX = spot.coordX;
        player.coordY = spot.coordY;
        player.stepControl = spot.stepControl;
        player.stepsRemain = player.stepsRemain -1;
        player.hasMoved = true;
        if (Object.prototype.hasOwnProperty.call(spot, 'flightControl')) {
            player.flightControl = spot.flightControl;
        } else {
            player.flightControl = 0;
        }
        if (!Object.prototype.hasOwnProperty.call(spot, 'seaRoute')) {
            player.boatTicket = false;
            player.freeBoatTicket = false;
        }
        const editedPlayer = await playersService.editPlayer(player);
        socket.emit('playerToEdit', editedPlayer);
    } catch (e) {
        console.log('error', e);
    }
};

export const flyPawn = async (spot, player) => {
    try {
        player.coordX = spot.coordX;
        player.coordY = spot.coordY;
        player.stepControl = spot.stepControl;
        player.flightControl = spot.flightControl;
        player.stepsRemain = 0;
        player.hasMoved = true;
        player.hasFlown = true;
        player.flightTicket = false;
        player.money = player.money -300;
        const editedPlayer = await playersService.editPlayer(player);
        socket.emit('playerToEdit', editedPlayer);
    } catch (e) {
        console.log('error', e);
    }
};

const Pawn = () => {
    const players = useSelector(state => state.players);

    const fitNewMap = {
        margin: 0,
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
    };
    
    const pawnLocation = (player) => {
        return {
            position: 'absolute',
            top: `${player.coordY-27}px`,
            left: `${player.coordX-483}px`
        };
        // return {
        //     position: 'absolute',
        //     top: `${player.coordY-27}px`,
        //     left: `${player.coordX-7}px`
        // };
    };

    const pawnColor = (player) => {
        return {
            borderBottom: `12px solid ${player.color}`
        };
    };

    return (
        <React.Fragment>
            {players.map(player =>
                <div style={fitNewMap} key={player.id}>
                    <span style={pawnLocation(player)}>
                        <PawnStyle style={pawnColor(player)} />
                    </span>
                </div>
            )}
        </React.Fragment>
    );
};

const PawnStyle = styled.span`
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    z-index: 5000;
`;

export default Pawn;