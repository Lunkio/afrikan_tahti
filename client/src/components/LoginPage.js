import React, { useState } from 'react';
import { Container, TextField, Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { newUser } from '../reducers/userReducer';
import { setAlert } from '../reducers/alertReducer';
import { v4 as uuid } from 'uuid';
import { lobbySocket } from '../index';

const LoginPage = () => {
    const dispatch = useDispatch();
    const [playername, setPlayername] = useState('');

    const handleNewPlayer = (event) => {
        event.preventDefault();
        if (playername === '') {
            dispatch(setAlert('Syötä nimi'));
            return;
        }
        const id = uuid();
        const user = {
            name: playername,
            uuid: id
        };
        const newPlayer = {
            name: playername,
            color: '',
            inLobby: false,
            lobbyuuid: '',
            host: false,
            lobbyCreator: false,
            lobbyReady: false,
            startReady: false,
            stepControl: 0,
            flightControl: 0,
            coordX: 0,
            coordY: 0,
            turnOrder: Math.ceil(Math.random() * 10000000),
            canPlay: false,
            hasMoved: false,
            stepsRemain: 0,
            hasFlown: false,
            flightTicket: false,
            boatTicket: false,
            freeBoatTicket: false,
            money: 3000,
            hasWatchedTreasure: false,
            hasGambled: false,
            hasStar: false,
            hasShoe: false,
            firstInCapeTown: false,
            firstInGoldCoast: false,
            winner: false,
            uuid: id,
        };
        lobbySocket.emit('addPlayer', newPlayer);
        dispatch(newUser(user));
    };

    return (
        <div>
            <Container maxWidth='md' style={{marginTop: '8rem'}}>
                <form onSubmit={handleNewPlayer}>
                    <TextField 
                        autoFocus
                        variant='outlined'
                        size='medium'
                        placeholder='Player name'
                        type='text'
                        value={playername}
                        onChange={e => setPlayername(e.target.value)}
                    />
                    <hr />
                    <Button variant='contained' color='primary' type='submit'>
                        Go!
                    </Button>
                </form>
            </Container>
        </div>
    );
};

export default LoginPage;