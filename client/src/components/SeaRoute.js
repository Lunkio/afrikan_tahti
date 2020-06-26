import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { movePawn } from './Pawn';
import { setAlert } from '../reducers/alertReducer';

const SeaRoute = () => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);
    const seaRoutes = useSelector(state => state.seaRoutes);
    //console.log('seaRoutes', seaRoutes);

    const movePlayer = (spot) => {
        const player = inGamePlayers.find(p => p.canPlay === true);
        if (!player) {
            return;
        }
        if (player.flightTicket) {
            dispatch(setAlert('Valitse oikea lentokohde'));
            return;
        }
        const playerIsUser = player.uuid === user.uuid;
        if (!playerIsUser) {
            return;
        }
        if (player.stepControl === spot.stepControl) {
            return;
        }
        if (!player.boatTicket && !player.freeBoatTicket) {
            dispatch(setAlert('Tarvitset laivalipun'));
            return;
        }
        if (player.stepsRemain === 0) {
            return;
        }
        if (Object.prototype.hasOwnProperty.call(spot, 'canStep')) {
            spot.canStep.forEach(v => {
                if (v === player.stepControl) {
                    movePawn(spot, player);
                    return;
                }
            });
        }
        if (player.stepControl === spot.stepControl -1 || player.stepControl === spot.stepControl +1) {
            movePawn(spot, player);
        }
    };

    return (
        <div>
            {seaRoutes.map(spot =>
                <SeaRouteStyle 
                    key={spot.id}
                    style={{top: `${spot.coordY-6}px`, left: `${spot.coordX-6}px`}}
                    onClick={() => movePlayer(spot)}
                >
                    {/* <p style={{ color: 'green', zIndex: '9000'}}>{spot.id}</p> */}
                </SeaRouteStyle>
            )}
        </div>
    );
};

const SeaRouteStyle = styled.div`
    height: 12px;
    width: 12px;
    background-color: rgb(4, 15, 172);
    border-radius: 100%;
    border: 1px solid black;
    position: absolute;
    cursor: pointer;
`;

export default SeaRoute;