import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../../reducers/alertReducer';
import { socket } from '../../index';

const GamingPhase = () => {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);
    const landingSpots = useSelector(state => state.landingSpots);
    const startPoints = useSelector(state => state.startPoints);
    const [diceBeenThrown, setDiceBeenThrown] = useState(false);
    const [throwingDice, setThrowingDice] = useState(false);
    const [diceValue, setDiceValue] = useState(1);
    const [confirmEndTurn, setConfirmEndTurn] = useState(false);
    const [stepsRemainInCaseBoatTicketCancel, setStepsRemainInCaseBoatTicketCancel] = useState(0);
    // const [amountOfPlayers, setAmountOfPlayers] = useState(players.length);
    //console.log('playersamount', players.length);

    // asettaa pelaajille (player.turn) arvoksi 0,1,2 jne... Vain kerran
    useEffect(() => {
        const gameTurn = () => {
            let turnNumber = 0;
            let turnAmount = 0;
            while (turnAmount < players.length) {
                for (let i = 0; i < players.length; i++) {
                    if (players[i].turnOrder === turnNumber) {
                        players[i].turnOrder = turnAmount;
                        if (players[i].turnOrder === 0) {
                            players[i].canPlay = true;
                        }
                        socket.emit('playerToEdit', players[i]);
                        turnAmount++;
                    }
                }
                turnNumber++;
            }
        };
        gameTurn();
    // eslint-disable-next-line
    }, []);

    // useEffect(() => {
    //     const amountOfPlayersCurrently = players.length;
    //     if (amountOfPlayersCurrently !== amountOfPlayers) {

    //     }
    // }, [players]);

    const player = players.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const changeTurn = () => {
        const previousPlayer = players.find(p => p.canPlay === true);
        previousPlayer.canPlay = false;
        previousPlayer.flightTicket = false;
        previousPlayer.stepsRemain = 0;
        let nextPlayer = players.find(p => p.turnOrder === previousPlayer.turnOrder +1);
        if (!nextPlayer) {
            nextPlayer = players.find(p => p.turnOrder === 0);
        }
        nextPlayer.canPlay = true;
        nextPlayer.hasWatchedTreasure = false;
        nextPlayer.hasGambled = false;
        nextPlayer.hasMoved = false;
        nextPlayer.hasFlown = false;
        if (nextPlayer.freeBoatTicket) {
            nextPlayer.stepsRemain = 2;
        }
        socket.emit('playerToEdit', previousPlayer);
        socket.emit('playerToEdit', nextPlayer);
        setDiceBeenThrown(false);
    };

    const endTurn = () => {
        if (confirmEndTurn) {
            changeTurn();
        }
        setConfirmEndTurn(!confirmEndTurn);
    };

    const getPlayerWhoHasTurn = () => {
        const player = players.find(p => p.canPlay === true);
        if (!player) {
            return;
        }
        return player.name;
    };

    const diceCanBeThrown = () => {
        if (player.freeBoatTicket || player.flightTicket || player.hasMoved || player.hasGambled || player.hasWatchedTreasure || diceBeenThrown || !player.canPlay) {
            return true;
        } else {
            return false;
        }
    };

    const throwDice = () => {
        const player = players.find(p => p.canPlay === true);
        if (player) {
            let randomNumber = Math.round(Math.random() * (6 - 1) + 1);
            setDiceValue(randomNumber);
            setDiceBeenThrown(true);
            setThrowingDice(true);
            setTimeout(() => {
                setThrowingDice(false);
            }, 500);
            player.stepsRemain = randomNumber;
            socket.emit('playerToEdit', player);
        }
    };
    const notThrowingDice = { display: throwingDice ? 'none' : '', marginLeft: '1rem' };
    const isThrowingDice = { display: throwingDice ? '' : 'none', marginLeft: '1rem' };

    const playerCanBuyFlightTicket = () => {
        if (!player.canPlay || player.boatTicket || player.freeBoatTicket || player.hasWatchedTreasure || player.hasGambled || player.hasFlown) {
            return true;
        }
        let spot = undefined;
        spot = landingSpots.find(s => s.stepControl === player.stepControl);
        if (!spot) {
            spot = startPoints.find(s => s.stepControl === player.stepControl);
        }
        if (spot) {
            return !Object.prototype.hasOwnProperty.call(spot, 'canFly');
        }
        return true;
    };

    const flyPlayer = () => {
        if (player.canPlay) {
            let spot = undefined;
            spot = landingSpots.find(s => s.stepControl === player.stepControl);
            if (!spot) {
                spot = startPoints.find(s => s.stepControl === player.stepControl);
            }
            if (!spot) {
                return;
            }
            if (player.money < 300) {
                dispatch(setAlert('Ei rahaa lentämiseen'));
                return;
            }
            player.flightTicket = !player.flightTicket;
            socket.emit('playerToEdit', player);
        }
    };

    const playerCanBuyBoatTicket = (playerHasTicket) => {
        if (!player.canPlay || player.flightTicket || player.hasWatchedTreasure || player.hasGambled || player.hasFlown || playerHasTicket) {
            return true;
        }
        if (player.stepsRemain === 0 && player.hasMoved) {
            return true;
        }
        let spot = undefined;
        spot = landingSpots.find(s => s.stepControl === player.stepControl);
        if (!spot) {
            spot = startPoints.find(s => s.stepControl === player.stepControl);
        }
        if (spot) {
            return !spot.canBoat;
        }
        return true;
    };

    const playerBuyBoatTicket = (type) => {
        if (player.canPlay) {
            if (type === 'costs') {
                if (player.boatTicket) {
                    player.money = player.money +100;
                    player.boatTicket = false;
                } else {
                    if (player.money < 100) {
                        dispatch(setAlert('Ei rahaa laivamatkaan'));
                        return;
                    }
                    player.money = player.money -100;
                    player.boatTicket = true;
                }
            }
            if (type === 'free') {
                if (player.freeBoatTicket) {
                    player.freeBoatTicket = false;
                    player.stepsRemain = stepsRemainInCaseBoatTicketCancel;
                } else {
                    player.freeBoatTicket = true;
                    setStepsRemainInCaseBoatTicketCancel(player.stepsRemain);
                    player.stepsRemain = 2;
                }
            }
            socket.emit('playerToEdit', player);
        }
    };

    return (
        <div>
            <GameHeader>
                <p>Vuorossa: <b>{getPlayerWhoHasTurn()}</b></p>
                <Button disabled={!player.canPlay} onClick={endTurn} variant='contained' color='secondary'>
                    {confirmEndTurn
                        ? 'Varmasti?'
                        : 'Vuoro'
                    }
                </Button>
            </GameHeader>
            <DiceContainer>
                <Button disabled={diceCanBeThrown()} onClick={throwDice} color='primary' variant='contained'>
                    <span>Heitä <Icon icon='dice' /></span>
                </Button>
                <div style={notThrowingDice}>
                    <Dice>{diceValue}</Dice>
                </div>
                <div style={isThrowingDice}>
                    Heitto...
                </div>
            </DiceContainer>
            <ButtonsContainer>
                <Button
                    style={{width: '100%'}}
                    color='secondary'
                    variant='outlined'
                    disabled={playerCanBuyFlightTicket()}
                    onClick={flyPlayer}
                >
                    {player.flightTicket
                        ? (<span>Peru lento <Icon icon='plane-slash' /></span>)
                        : (<span>Lennä <Icon icon='plane' /> (300)</span>)
                    }
                </Button>
                <Button
                    style={{width: '100%'}}
                    color='primary'
                    variant='outlined'
                    disabled={playerCanBuyBoatTicket(player.freeBoatTicket)}
                    onClick={() => playerBuyBoatTicket('costs')}
                >
                    {player.boatTicket
                        ? (<span>Peru matka <Icon icon='ship' /></span>)
                        : (<span>Lippu <Icon icon='ship' /> (100)</span>)
                    }
                </Button>
                <Button
                    style={{width: '100%'}}
                    color='primary'
                    variant='outlined'
                    disabled={playerCanBuyBoatTicket(player.boatTicket)}
                    onClick={() => playerBuyBoatTicket('free')}
                >
                    {player.freeBoatTicket
                        ? (<span>Peru matka <Icon icon='ship' /></span>)
                        : (<span>Ilmainen <Icon icon='ship' /></span>)
                    }
                </Button>
            </ButtonsContainer>
        </div>
    );
};

const GameHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const DiceContainer = styled.div`
    display: flex;
    align-items: center;
`;

const Dice = styled.div`
    height: 20px;
    width: 20px;
    border: 2px solid black;
    text-align: center;
    margin-left: 1rem;
`;

const ButtonsContainer = styled.div`
    margin-top: 0.5rem;
`;

export default GamingPhase;