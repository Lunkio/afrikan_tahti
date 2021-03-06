import React, { useEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import kenka from '../images/kenka.png';
import tahti from '../images/tahti.png';
import { Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../reducers/alertReducer';
import { turnToTrue } from '../reducers/turnReducer';
import { gameSocket } from '../SocketsGame';

const PlayerView = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const landingSpots = useSelector(state => state.landingSpots);
    const landingTokens = useSelector(state => state.landingTokens);
    const starIsFound = useSelector(state => state.starIsFound);

    // tarkistaa Afrikan tähden löytäjän ja ilmoittaa siitä kunnes pelaaja löytää hevosenkengän
    useEffect(() => {
        const playerWithStar = inGamePlayers.find(p => p.hasStar === true);
        if (playerWithStar) {
            if (user.uuid !== playerWithStar.uuid) {
                dispatch(setAlert(`${playerWithStar.name} on löytänyt Afrikan Tähden! Löydä hevosenkenkä pian!`));
            }
        }
    // eslint-disable-next-line
    }, [starIsFound]);

    const player = inGamePlayers.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const checkIfGoldCoastIsJewel = (player) => {
        if (player.stepControl === 507) {
            if (!(inGamePlayers.find(p => p.firstInGoldCoast === true))) {
                player.firstInGoldCoast = true;
                const landingSpot = landingSpots.find(s => s.stepControl === player.stepControl);
                const landingToken = landingTokens.find(t => t.landingSpotId === landingSpot.id);
                player.money = player.money + landingToken.moneyValue;
                dispatch(setAlert('Löysit Gold Coastista jalokiven, sait jalokivestä kaksinkertaisen maksun'));
            }
        }
    };

    const checkLandingTokenType = (landingToken, player) => {
        switch (landingToken.type) {
        case 'tyhja':
            break;
        case 'keltainen':
            player.money = player.money +300;
            dispatch(setAlert('Löysit Topaasin! +300 rahaa'));
            checkIfGoldCoastIsJewel(player);
            break;
        case 'vihrea':
            player.money = player.money +600;
            dispatch(setAlert('Löysit Smaragdin! +600 rahaa'));
            checkIfGoldCoastIsJewel(player);
            break;
        case 'punainen':
            player.money = player.money +1000;
            dispatch(setAlert('Löysit Rubiinin! +1000 rahaa'));
            checkIfGoldCoastIsJewel(player);
            break;
        case 'rosvo':
            player.money = 0;
            dispatch(setAlert('Rosvot veivät kaiken omaisuutesi mukanaan =('));
            break;
        case 'tahti':
            player.hasStar = true;
            dispatch(setAlert('Löysit Afrikan tähden! Vie se takaisin Kairoon tai Tangeriin'));
            break;
        case 'kenka':
            if (inGamePlayers.find(p => p.hasStar === true)) {
                const playerHasStar = inGamePlayers.find(p => p.hasStar === true);
                if (user.uuid !== playerHasStar.uuid) {
                    player.hasShoe = true;
                    dispatch(setAlert(
                        `Löysit hevosenkengän, vie se Kairoon tai Tangeriin ennen
                        Afrikan tähteä`
                    ));
                }
            }
            break;
        default: break;
        }
    };

    const playerOnTopOfLandingSpot = () => {
        if (!player.canPlay || player.hasGambled) {
            return true;
        }
        if (player.stepControl >= 501 && player.stepControl <= 530) {
            const landingSpot = landingSpots.find(s => s.stepControl === player.stepControl);
            if (landingSpot) {
                return landingSpot.revealed;
            }
            return false;
        }
        return true;
    };

    const watchTreasure = () => {
        if (player.canPlay) {
            const landingSpot = landingSpots.find(s => s.stepControl === player.stepControl);
            if (!landingSpot) {
                return;
            }
            if (player.money < 100) {
                dispatch(setAlert('Ei riittävästi rahaa'));
                return;
            }
            const landingToken = landingTokens.find(t => t.landingSpotId === landingSpot.id);
            if (!landingToken) {
                return;
            }
            player.stepsRemain = 0;
            player.hasWatchedTreasure = true;
            player.money = player.money -100;
            checkLandingTokenType(landingToken, player);
            gameSocket.emit('inGamePlayerToEdit', player);
            gameSocket.emit('revealLandingSpot', landingSpot);
            if (player.hasStar && starIsFound === false) {
                gameSocket.emit('starIsFound', player);
            }
            dispatch(turnToTrue());
        }
    };

    const gambleTreasure = () => {
        if (player.canPlay) {
            const landingSpot = landingSpots.find(s => s.stepControl === player.stepControl);
            if (!landingSpot) {
                return;
            }
            const landingToken = landingTokens.find(t => t.landingSpotId === landingSpot.id);
            if (!landingToken) {
                return;
            }
            player.stepsRemain = 0;
            if (Math.random() > 0.5) {
                player.hasWatchedTreasure = true;
                checkLandingTokenType(landingToken, player);
                gameSocket.emit('revealLandingSpot', landingSpot);
            } else {
                dispatch(setAlert('Aarre ei löytynyt tällä kertaa =('));
            }
            player.hasGambled = true;
            gameSocket.emit('inGamePlayerToEdit', player);
            dispatch(turnToTrue());
        }
    };

    const showStarImage = (hasStar) => {
        return { display: hasStar ? '' : 'none' };
    };

    const showShoeImage = (hasShoe) => {
        return { display: hasShoe ? '' : 'none' };
    };

    return (
        <React.Fragment>
            <hr />
            <PlayerHeader>
                <PlayerName style={{color: player.color}}>
                    {user.name}
                </PlayerName>
                <div>
                    <ImageStyle style={showStarImage(player.hasStar)} src={tahti} alt='tähti' />
                    <ImageStyle style={showShoeImage(player.hasShoe)} src={kenka} alt='hevosenkenkä' />
                </div>
            </PlayerHeader>
            <div>
                <p style={{marginBottom: '-0.5rem'}}>Rahat: <b>{player.money}</b></p>
                <p>Askeleet: <b>{player.stepsRemain}</b></p>
            </div>
            <div>
                <Button
                    style={{width: '100%', marginBottom: '0.2rem'}}
                    color='primary'
                    variant='contained'
                    disabled={playerOnTopOfLandingSpot()}
                    onClick={watchTreasure}
                >
                    <span>Käännä <Icon icon='gem' /> (100)</span>
                </Button>
                <Button
                    style={{width: '100%'}}
                    color='primary'
                    variant='contained'
                    disabled={playerOnTopOfLandingSpot()}
                    onClick={gambleTreasure}
                >
                    <span>Uhkapelaa <Icon icon='gem' /> (50%)</span>
                </Button>
            </div>
        </React.Fragment>
    );
};

const PlayerHeader = styled.div`
    display: flex;
    align-items: center;
    margin-top: -1.5rem;
    margin-bottom: -1.5rem;
`;

const PlayerName = styled.h2`
    margin-right: 0.5rem;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
`;

const ImageStyle = styled.img`
    width: 30px;
`;

export default PlayerView;