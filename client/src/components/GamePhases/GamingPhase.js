import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../../reducers/alertReducer';
import playersService from '../../services/playersService';
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
    console.log('playersamount', players.length);

    // asettaa pelaajille (player.turn) arvoksi 0,1,2 jne... Vain kerran
    useEffect(() => {
        const gameTurn = async () => {
            let turnNumber = 0;
            let turnAmount = 0;
            try {
                while (turnAmount < players.length) {
                    for (let i = 0; i < players.length; i++) {
                        if (players[i].turnOrder === turnNumber) {
                            players[i].turnOrder = turnAmount;
                            if (players[i].turnOrder === 0) {
                                players[i].canPlay = true;
                            }
                            const playerTurn = await playersService.editPlayer(players[i]);
                            socket.emit('playerToEdit', playerTurn);
                            turnAmount++;
                        }
                    }
                    turnNumber++;
                }
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Jokin meni vuorojen asettelussa pieleen =('));
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

    const changeTurn = async () => {
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
        try {
            socket.emit('playerToEdit', previousPlayer);
            await playersService.editPlayer(previousPlayer);
            const editedNextPlayer = await playersService.editPlayer(nextPlayer);
            socket.emit('playerToEdit', editedNextPlayer);
            setDiceBeenThrown(false);
        } catch (e) {
            console.log('error', e);
            dispatch(setAlert('Jokin meni vuoron antamisessa seuraavalle pelaajalle pieleen =('));
        }
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

    const throwDice = async () => {
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
            const editedPlayer = await playersService.editPlayer(player);
            socket.emit('playerToEdit', editedPlayer);
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

    const flyPlayer = async () => {
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
            try {
                player.flightTicket = !player.flightTicket;
                const editedPlayer = await playersService.editPlayer(player);
                socket.emit('playerToEdit', editedPlayer);
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Jokin meni lentämisessä pieleen =('));
            }
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

    const playerBuyBoatTicket = async (type) => {
        if (player.canPlay) {
            try {
                if (type === 'costs') {
                    if (player.boatTicket) {
                        player.money = player.money +100;
                        player.boatTicket = false;
                    } else {
                        if (player.money < 100) {
                            dispatch(setAlert('Ei rahaa laivalippuun'));
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
                const editedPlayer = await playersService.editPlayer(player);
                socket.emit('playerToEdit', editedPlayer);
            } catch (e) {
                console.log('error', e);
                dispatch(setAlert('Jokin meni laivalippujen hankinnassa pieleen =('));
            }
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
                    Heitä noppaa
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
                    color='secondary'
                    variant='outlined'
                    disabled={playerCanBuyFlightTicket()}
                    onClick={flyPlayer}
                >
                    {player.flightTicket
                        ? 'Peru lento'
                        : 'Osta lento (300)'
                    }
                </Button>
                <Button
                    color='primary'
                    variant='outlined'
                    disabled={playerCanBuyBoatTicket(player.freeBoatTicket)}
                    onClick={() => playerBuyBoatTicket('costs')}
                >
                    {player.boatTicket
                        ? 'Peru laivamatka'
                        : 'Osta laivalippu (100)'
                    }
                </Button>
                <Button
                    color='primary'
                    variant='outlined'
                    disabled={playerCanBuyBoatTicket(player.boatTicket)}
                    onClick={() => playerBuyBoatTicket('free')}
                >
                    {player.freeBoatTicket
                        ? 'Peru laivamatka'
                        : 'Ilmainen laiva (+2 askelta)'
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