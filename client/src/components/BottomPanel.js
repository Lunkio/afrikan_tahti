import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { removeAllInGamePlayersFromState } from '../reducers/inGamePlayersReducer';
import { removePlayerFromLobby, setDefaultPlayerProperties } from '../gameUtils';

const BottomPanel = ({ setPlayerLeftFromGame, setPlayerLobbyReady, setPlayerInLobby, setPlayerGameReady }) => {
    const dispatch = useDispatch();
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    const user = useSelector(state => state.user);

    const handlePlayerLeave = async () => {
        await removePlayerFromLobby(player, 'gameSocketIsActivated');
        setDefaultPlayerProperties(player, 'leaving');
        dispatch(removeAllInGamePlayersFromState());
        setPlayerInLobby(false);
        setPlayerGameReady(false);
        setPlayerLobbyReady(false);
        setPlayerLeftFromGame({ state: true, player: player });
    };

    const player = inGamePlayers.find(p => p.uuid === user.uuid);
    if (!player) {
        return null;
    }

    return (
        <Panel>
            <div>
                <Button
                    color='primary'
                    variant='contained'
                    target='_blank'
                    rel='noreferrer noopener'
                    href='https://kariteam.fi/storage/product_files/5/105385_Afrikan_t_hti_peliohjeet.pdf?name=5/105385_Afrikan_t_hti_peliohjeet.pdf'
                >
                    Pelin säännöt
                </Button>
            </div>
            <div>
                <Button 
                    color='secondary'
                    variant='contained'
                    onClick={handlePlayerLeave}
                >
                    Poistu pelistä
                </Button>
            </div>
        </Panel>
    );
};

const Panel = styled.div`
    display: flex;
    justify-content: space-between;
`;

BottomPanel.propTypes = {
    setPlayerLeftFromGame: PropTypes.func,
    setPlayerLobbyReady: PropTypes.func,
    setPlayerInLobby: PropTypes.func,
    setPlayerGameReady: PropTypes.func
};

export default BottomPanel;