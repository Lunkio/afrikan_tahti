import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { movePawn } from './Pawn';
import { setAlert } from '../reducers/alertReducer';

const LandRoute = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);
    const landRoutes = useSelector(state => state.landRoutes);
    //console.log('landRoutes', landRoutes);

    const movePlayer = (spot) => {
        const player = players.find(p => p.canPlay === true);
        if (!player) {
            return;
        }
        const playerIsUser = player.uuid === user.uuid;
        if (!playerIsUser) {
            return;
        }
        if (player.flightTicket) {
            dispatch(setAlert('Valitse oikea lentokohde'));
            return;
        }
        if (player.boatTicket || player.freeBoatTicket) {
            dispatch(setAlert('Laivalipulla ei voi matkustaa maateitä pitkin'));
            return;
        }
        if (player.stepControl === spot.stepControl) {
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
            {landRoutes.map(spot =>
                <LandRouteStyle
                    key={spot.id}
                    style={{top: `${spot.coordY-6}px`, left: `${spot.coordX-6}px`}}
                    onClick={() => movePlayer(spot)}
                >
                    {/* <p style={{ color: 'green', zIndex: '9000'}}>{spot.id}</p> */}
                </LandRouteStyle>
            )}
        </div>
    );
};

const LandRouteStyle = styled.div`
    height: 12px;
    width: 12px;
    background-color: black;
    border-radius: 100%;
    position: absolute;
    cursor: pointer;
`;

export default LandRoute;