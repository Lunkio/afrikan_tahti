import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { useStyles } from '../../styles/styles';
import { Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { setAlert } from '../../reducers/alertReducer';
import { initInGamePlayers } from '../../reducers/inGamePlayersReducer';
import { turnToFalse } from '../../reducers/turnReducer';
import { decreaseTimer } from '../../reducers/timerReducer';
import { gameSocket } from '../../SocketsGame';

const GamingPhase = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const timer = useSelector(state => state.timer);
    const turn = useSelector(state => state.turn);
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);
    const landingSpots = useSelector(state => state.landingSpots);
    const startPoints = useSelector(state => state.startPoints);
    const diceValue = useSelector(state => state.dice);
    const [diceBeenThrown, setDiceBeenThrown] = useState(false);
    const [throwingDice, setThrowingDice] = useState(false);
    const [confirmEndTurn, setConfirmEndTurn] = useState(false);
    const [stepsRemainInCaseBoatTicketCancel, setStepsRemainInCaseBoatTicketCancel] = useState(0);
    const [amountOfPlayers, setAmountOfPlayers] = useState(inGamePlayers.length);
    const [currentPlayerTurnOrder, setCurrentPlayerTurnOrder] = useState(0);

    // asettaa pelaajille (player.turnOrder) arvoksi 0,1,2 jne... Vain kerran
    useEffect(() => {
        let firstPlayer = null;
        const gameTurnSetter = () => {
            let turnNumber = 0;
            let turnAmount = 0;
            while (turnAmount < inGamePlayers.length) {
                for (let i = 0; i < inGamePlayers.length; i++) {
                    if (inGamePlayers[i].turnOrder === turnNumber) {
                        inGamePlayers[i].turnOrder = turnAmount;
                        if (inGamePlayers[i].turnOrder === 0) {
                            inGamePlayers[i].canPlay = true;
                            firstPlayer = inGamePlayers[i];
                        }
                        //gameSocket.emit('inGamePlayerToEdit', inGamePlayers[i]);
                        turnAmount++;
                    }
                }
                turnNumber++;
            }
        };
        gameTurnSetter();
        gameSocket.emit('inGamePlayersTurnEdit', inGamePlayers);
        if (player.uuid === firstPlayer.uuid) {
            gameSocket.emit('setCounter', firstPlayer);
        }
    // eslint-disable-next-line
    }, []);

    // pitää kirjaa pelaajista, jos joku pelaaja lähtee pelistä niin korjaa turn-numerot
    useEffect(() => {
        const amountOfPlayersCurrently = inGamePlayers.length;
        if (amountOfPlayersCurrently !== amountOfPlayers) {
            const sortedPlayers = inGamePlayers.sort((a,b) => a.turnOrder - b.turnOrder);
            if (sortedPlayers.length > 0) {
                for (let i = 0; i < sortedPlayers.length; i++) {
                    sortedPlayers[i].turnOrder = i;
                }
                const thereIsPlayerWhoCanPlay = sortedPlayers.find(p => p.canPlay === true);
                if (!thereIsPlayerWhoCanPlay) {
                    const playerToHaveTurn = sortedPlayers[currentPlayerTurnOrder];
                    if (!playerToHaveTurn) {
                        sortedPlayers[0].canPlay = true;
                    } else {
                        playerToHaveTurn.canPlay = true;
                    }
                }
                dispatch(initInGamePlayers(sortedPlayers));
                setAmountOfPlayers(amountOfPlayersCurrently);
            }
        }
    // eslint-disable-next-line
    }, [inGamePlayers]);

    // vaihtaa vuoroa kun pelaaja on katsonut tokenin (siksi reducer koska tokenin katsominen eri komponentissa ja changeTurn() -funktiota ei voi siirtää tästä komponentista)
    useEffect(() => {
        if (turn) {
            changeTurn();
            dispatch(turnToFalse());
        }
    // eslint-disable-next-line
    }, [turn]);

    // Timer
    useEffect(() => {
        if (timer.player !== null) {
            if (timer.counter > -1) {
                dispatch(decreaseTimer(timer.counter -1, timer.player));
            }
            if (player.canPlay) {
                if (timer.counter === -1) {
                    if (timer.player.uuid === player.uuid) {
                        changeTurn();
                    }
                }
            }
        }
    // eslint-disable-next-line
    }, [timer]);

    const player = inGamePlayers.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    const changeTurn = () => {
        let previousPlayer = inGamePlayers.find(p => p.canPlay === true);
        if (!previousPlayer) {
            previousPlayer = inGamePlayers.find(p => p.turnOrder === 0);
        }
        previousPlayer.canPlay = false;
        previousPlayer.flightTicket = false;
        previousPlayer.stepsRemain = 0;
        let nextPlayer = inGamePlayers.find(p => p.turnOrder === previousPlayer.turnOrder +1);
        if (!nextPlayer) {
            nextPlayer = inGamePlayers.find(p => p.turnOrder === 0);
        }
        nextPlayer.canPlay = true;
        nextPlayer.hasWatchedTreasure = false;
        nextPlayer.hasGambled = false;
        nextPlayer.hasMoved = false;
        nextPlayer.hasFlown = false;
        if (nextPlayer.freeBoatTicket) {
            nextPlayer.stepsRemain = 2;
        }
        gameSocket.emit('inGamePlayerToEdit', previousPlayer);
        gameSocket.emit('inGamePlayerToEdit', nextPlayer);
        setCurrentPlayerTurnOrder(nextPlayer.turnOrder);
        setDiceBeenThrown(false);
        gameSocket.emit('setCounter', nextPlayer);
    };

    const endTurn = () => {
        if (confirmEndTurn) {
            changeTurn();
        }
        setConfirmEndTurn(!confirmEndTurn);
    };

    const getPlayerWhoHasTurn = () => {
        const player = inGamePlayers.find(p => p.canPlay === true);
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
        const player = inGamePlayers.find(p => p.canPlay === true);
        if (player) {
            let randomNumber = Math.round(Math.random() * (6 - 1) + 1);
            setDiceBeenThrown(true);
            setThrowingDice(true);
            setTimeout(() => {
                setThrowingDice(false);
            }, 500);
            player.stepsRemain = randomNumber;
            gameSocket.emit('inGamePlayerToEdit', player);
            gameSocket.emit('diceThrow', player, randomNumber);
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
            gameSocket.emit('inGamePlayerToEdit', player);
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
            gameSocket.emit('inGamePlayerToEdit', player);
        }
    };

    return (
        <div>
            <TurnButton>
                <Button className={classes.yellowButton} disabled={!player.canPlay} onClick={endTurn} variant='contained' color='secondary' fullWidth >
                    {confirmEndTurn
                        ? 'Varmasti?'
                        : 'Lopeta vuoro'
                    }
                </Button>
            </TurnButton>
            <GameHeader>
                <p>Vuorossa: <b>{getPlayerWhoHasTurn()}</b></p>
                <h3>{timer.counter}</h3>
            </GameHeader>
            <DiceContainer>
                <Button className={classes.lightBlueButton} disabled={diceCanBeThrown()} onClick={throwDice} color='primary' variant='contained'>
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
                    style={{width: '100%', marginBottom: '0.2rem'}}
                    color='secondary'
                    variant='contained'
                    disabled={playerCanBuyFlightTicket()}
                    onClick={flyPlayer}
                >
                    {player.flightTicket
                        ? (<span>Peru lento <Icon icon='plane-slash' /></span>)
                        : (<span>Lennä <Icon icon='plane' /> (300)</span>)
                    }
                </Button>
                <Button
                    style={{width: '100%', marginBottom: '0.2rem'}}
                    color='primary'
                    variant='contained'
                    disabled={playerCanBuyBoatTicket(player.freeBoatTicket)}
                    onClick={() => playerBuyBoatTicket('costs')}
                >
                    {player.boatTicket
                        ? (<span>Peru matka <Icon icon='ship' /></span>)
                        : (<span>Laiva <Icon icon='ship' /> (100)</span>)
                    }
                </Button>
                <Button
                    style={{width: '100%'}}
                    color='primary'
                    variant='contained'
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

const TurnButton = styled.div`
    margin-bottom: -0.7rem;
    margin-top: 0.2rem;
`;

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