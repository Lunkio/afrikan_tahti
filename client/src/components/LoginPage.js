import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, TextField, Button, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { newUser } from '../reducers/userReducer';
import { setAlert } from '../reducers/alertReducer';
import { v4 as uuid } from 'uuid';
import { lobbySocket } from '../SocketsLobby';

const LoginPage = () => {
    const dispatch = useDispatch();
    const [playername, setPlayername] = useState('');

    const handleNewPlayer = (event) => {
        event.preventDefault();
        if (playername === '') {
            dispatch(setAlert('Syötä nimimerkki'));
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
            turnOrder: Math.ceil(Math.random() * 10000),
            canPlay: false,
            hasMoved: false,
            stepsRemain: 0,
            hasFlown: false,
            flightTicket: false,
            boatTicket: false,
            freeBoatTicket: false,
            money: 300,
            hasWatchedTreasure: false,
            hasGambled: false,
            hasStar: false,
            hasShoe: false,
            firstInCapeTown: false,
            firstInGoldCoast: false,
            winner: false,
            uuid: id,
        };
        // eslint-disable-next-line
        if (process.env.NODE_ENV === 'development') {
            newPlayer.money = 3000;
        }
        lobbySocket.emit('addPlayer', newPlayer);
        dispatch(newUser(user));
    };

    return (
        <div>
            <Container maxWidth='md'>
                <Header>
                    <Typography variant='h3'>
                        Tervetuloa pelaamaan Afrikan Tähteä!
                    </Typography>
                </Header>
                <form onSubmit={handleNewPlayer}>
                    <TextField 
                        autoFocus
                        style={{background: 'rgba(255,255,255, 0.7)'}}
                        variant='outlined'
                        size='medium'
                        placeholder='Nimimerkki'
                        type='text'
                        value={playername}
                        onChange={e => setPlayername(e.target.value)}
                    />
                    <hr />
                    <Button variant='contained' color='primary' type='submit'>
                        Pelaa!
                    </Button>
                </form>
            </Container>
        </div>
    );
};

const Header = styled.div`
    text-align: center;
    padding-top: 5rem;
    margin-bottom: 2rem;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    color: #5065e0;
`;


export default LoginPage;