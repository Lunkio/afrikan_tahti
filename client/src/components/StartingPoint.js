import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { movePawn, flyPawn } from './Pawn';
import { gameSocket } from '../SocketsGame';

const StartingPoint = () => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);
    const startPoints = useSelector(state => state.startPoints);

    const checkIfWinner = (player) => {
        if (player.stepControl >= 1001 && player.stepControl <= 1012) {
            if (player.hasStar || player.hasShoe) {
                player.winner = true;
                gameSocket.emit('inGamePlayerToEdit', player);
            }
        }
    };

    const movePlayer = (spot) => {
        const player = inGamePlayers.find(p => p.canPlay === true);
        if (!player) {
            return;
        }
        const playerIsUser = player.uuid === user.uuid;
        if (!playerIsUser) {
            return;
        }
        if (player.stepControl === spot.stepControl) {
            return;
        }
        if (player.flightTicket) {
            if (Object.prototype.hasOwnProperty.call(spot, 'canFly')) {
                spot.canFly.forEach(v => {
                    if (v === player.flightControl) {
                        flyPawn(spot, player);
                        checkIfWinner(player);
                        return;
                    }
                });
            }
            return;
        }
        if (player.stepsRemain === 0) {
            return;
        }
        spot.canStep.forEach(v => {
            if (v === player.stepControl) {
                movePawn(spot, player);
                checkIfWinner(player);
                return;
            }
        });
    };

    const setStartLocation = (point) => {
        if (inGamePlayers.find(p => p.stepControl === point.stepControl)) {
            dispatch(setAlert('Aloituspaikka jo valittu'));
            return;
        }
        const player = inGamePlayers.find(p => p.uuid === user.uuid);
        if (player.canPlay) {
            movePlayer(point);
            return;
        }
        if (player.startReady) {
            return;
        }
        player.stepControl = point.stepControl;
        player.flightControl = point.flightControl;
        player.coordX = point.coordX;
        player.coordY = point.coordY;
        gameSocket.emit('inGamePlayerToEdit', player);
    };

    return (
        <div>
            {startPoints.map(point =>
                <StartPoint 
                    key={point.id}
                    style={{top: `${point.coordY-6}px`, left: `${point.coordX-6}px`}}
                    onClick={() => setStartLocation(point)}
                >
                    {/* <p>{point.id}</p> */}
                </StartPoint>
            )}
        </div>
    );
};

const StartPoint = styled.div`
    height: 12px;
    width: 12px;
    background-color: rgba(255,255,255, 0.3);
    border-radius: 100%;
    border: 1px solid black;
    position: absolute;
    cursor: pointer;
`;

export default StartingPoint;