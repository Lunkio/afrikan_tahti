import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import pahvi from '../images/pahvi.png';
import { movePawn, flyPawn } from './Pawn';
import playersService from '../services/playersService';
import { socket } from '../index';
import { setAlert } from '../reducers/alertReducer';

const LandingSpot = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);
    const landingSpots = useSelector(state => state.landingSpots);
    const landingTokens = useSelector(state => state.landingTokens);

    const checkIfFirstInCapeTown = async (player) => {
        try {
            if (player.stepControl === 526) {
                if (!(players.find(p => p.firstInCapeTown === true))) {
                    player.firstInCapeTown = true;
                    player.money = player.money +500;
                    const editedPlayer = await playersService.editPlayer(player);
                    socket.emit('playerToEdit', editedPlayer);
                }
            }
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni Cape Town tarkastuksessa pieleen =('));
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
                        checkIfFirstInCapeTown(player);
                        return;
                    }
                });
            }
            return;
        }
        if (player.stepsRemain === 0) {
            return;
        }
        spot.canStep.forEach(async (v) => {
            if (v === player.stepControl) {
                movePawn(spot, player);
                checkIfFirstInCapeTown(player);
                return;
            }
        });
    };

    const treasureHider = (spot) => {
        return !spot.revealed ? 'pahvi pahvi-peittaa-false' : 'pahvi pahvi-peittaa-true';
    };

    return (
        <React.Fragment>
            {landingTokens.length === 0 &&
            <div>
                {landingSpots.map((spot) =>
                    <LandingSpotStyle 
                        key={spot.id}
                        style={{top: `${spot.coordY-17}px`, left: `${spot.coordX-17}px`}}
                        className='landing-spot-focus-removal'
                        onClick={() => movePlayer(spot)}
                    >
                    </LandingSpotStyle>
                )}
            </div>
            }
            {landingTokens.length > 0 &&
            <div>
                {landingSpots.map((spot) =>
                    <LandingSpotStyle 
                        key={spot.id}
                        style={{top: `${spot.coordY-17}px`, left: `${spot.coordX-17}px`}}
                        className='landing-spot-focus-removal'
                        onClick={() => movePlayer(spot)}
                    >
                        {/* <p>{spot.id}</p> */}
                        <img className='pahvi' src={landingTokens[spot.id -1].picture} alt='kuva' />
                        <img className={treasureHider(spot)} src={pahvi} alt='pahvipeittää' />
                    </LandingSpotStyle>
                )}
            </div>
            }
        </React.Fragment>
    );
};

const LandingSpotStyle = styled.button`
    height: 34px;
    width: 34px;
    background-color: rgb(211, 12, 12);
    border-radius: 100%;
    border: 1px solid black;
    position: absolute;
    cursor: pointer;
`;

export default LandingSpot;