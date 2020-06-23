import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import pawnYellow from '../images/pawn_yellow.png';
import pawnGreen from '../images/pawn_green.png';
import pawnTurq from '../images/pawn_turq.png';
import pawnRed from '../images/pawn_red.png';
import pawnWhite from '../images/pawn_white.png';
import pawnViolet from '../images/pawn_violet.png';
import { gameSocket } from '../index';

export const movePawn = (spot, player) => {
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
    gameSocket.emit('inGamePlayerToEdit', player);
};

export const flyPawn = (spot, player) => {
    player.coordX = spot.coordX;
    player.coordY = spot.coordY;
    player.stepControl = spot.stepControl;
    player.flightControl = spot.flightControl;
    player.stepsRemain = 0;
    player.hasMoved = true;
    player.hasFlown = true;
    player.flightTicket = false;
    player.money = player.money -300;
    gameSocket.emit('inGamePlayerToEdit', player);
};

const Pawn = () => {
    const user = useSelector(state => state.user);
    const inGamePlayers = useSelector(state => state.inGamePlayers);

    const currentPlayer = inGamePlayers.find(p => p.uuid === user.uuid);
    
    const pawnLocation = (player) => {
        const styleObject = {
            position: 'absolute',
            top: `${player.coordY-15}px`,
            left: `${player.coordX-5.5}px`
        };
        if (player.uuid === currentPlayer.uuid) {
            styleObject.zIndex = 300;
        }
        return styleObject;
    };

    const pawnColor = (color) => {
        switch (color) {
        case '#7fffd4':
            return pawnTurq;
        case '#ec1c24':
            return pawnRed;
        case '#f900fd':
            return pawnViolet;
        case '#0ed145':
            return pawnGreen;
        case '#e4e4e4':
            return pawnWhite;
        case '#fff200':
            return pawnYellow;
        default: return pawnWhite;
        }
    };

    return (
        <React.Fragment>
            {inGamePlayers.map(player =>
                <PawnStyle key={player.uuid} style={pawnLocation(player)}>
                    <PawnImage src={pawnColor(player.color)} alt='pawn' />
                </PawnStyle>
            )}
        </React.Fragment>
    );
};

const PawnStyle = styled.span`
    width: 0.8rem;
    pointer-events: none;
`;

const PawnImage = styled.img`
    max-width: 100%;
`;

export default Pawn;