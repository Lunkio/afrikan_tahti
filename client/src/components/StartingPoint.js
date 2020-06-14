import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import playersService from '../services/playersService';
import { socket } from '../index';
import { setAlert } from '../reducers/alertReducer';
import { movePawn, flyPawn } from './Pawn';

const StartingPoint = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);
    const startPoints = useSelector(state => state.startPoints);

    const checkIfWinner = async (player) => {
        try {
            if (player.stepControl >= 1001 && player.stepControl <= 1012) {
                if (player.hasStar || player.hasShoe) {
                    player.winner = true;
                    const editedPlayer = await playersService.editPlayer(player);
                    socket.emit('playerToEdit', editedPlayer);
                }
            }
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni voittajan tarkistuksessa pieleen =('));
        }
    };

    const movePlayer = (spot) => {
        const player = players.find(p => p.canPlay === true);
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

    const setStartLocation = async (point) => {
        try {
            if (players.find(p => p.stepControl === point.stepControl)) {
                dispatch(setAlert('Aloituspaikka jo valittu'));
                return;
            }
            const player = players.find(p => p.uuid === user.uuid);
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
            const editedPlayer = await playersService.editPlayer(player);
            socket.emit('playerToEdit', editedPlayer);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni pieleen =('));
        }
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