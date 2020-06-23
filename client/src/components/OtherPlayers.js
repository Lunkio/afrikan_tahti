import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import kenka from '../images/kenka.png';
import tahti from '../images/tahti.png';

const OtherPlayers = () => {
    const inGamePlayers = useSelector(state => state.inGamePlayers);
    //const players = useSelector(state => state.players);
    const user = useSelector(state => state.user);

    const otherPlayers = inGamePlayers.filter(p => p.uuid !== user.uuid);

    if (otherPlayers.length === 0) {
        return null;
    }

    const getPlayerColor = (color) => {
        return {backgroundColor: `${color}`};
    };

    const showStarImage = (hasStar) => {
        return {display: hasStar ? '' : 'none'};
    };

    const showShoeImage = (hasShoe) => {
        return {display: hasShoe ? '' : 'none'};
    };

    return (
        <div>
            <hr />
            <Header>Muut pelaajat:</Header>
            {otherPlayers.map(player =>
                <PlayerSection key={player.uuid}>
                    <PlayerHeader>
                        <div style={{display: 'flex'}}>
                            <PlayerName>{player.name}</PlayerName>
                            <ColorBall style={getPlayerColor(player.color)} />
                        </div>
                        <div>
                            <ImageStyle style={showStarImage(player.hasStar)} src={tahti} alt='tähti' />
                            <ImageStyle style={showShoeImage(player.hasShoe)} src={kenka} alt='hevosenkenkä' />
                        </div>
                    </PlayerHeader>
                    <PlayerInfo>
                        <PlayerMoney>Rahat: <b>{player.money}</b></PlayerMoney>
                        <PlayerDice>Askelia jäljellä: <b>{player.stepsRemain}</b></PlayerDice>
                    </PlayerInfo>
                </PlayerSection>
            )}
        </div>
    );
};

const Header = styled.h4`
    margin-top: 0rem;
    margin-bottom: 0.5rem;
`;

const PlayerSection = styled.div`
    border: 1.5px solid grey;
    padding: 0.5rem;
`;

const PlayerHeader = styled.div`
    display: flex;
    justify-content: space-between;
`;

const PlayerName = styled.p`
    font-size: 1rem;
    margin: 0;
`;

const ColorBall = styled.div`
    border-radius: 100%;
    height: 15px;
    width: 15px;
    margin-left: 0.5rem;
    border: 2px solid black;
`;

const PlayerInfo = styled.div`
    line-height: 80%;
`;

const PlayerMoney = styled.p`
    font-size: 0.8rem;
`;

const PlayerDice = styled.div`
    font-size: 0.8rem;
`;

const ImageStyle = styled.img`
    width: 20px;
`;

export default OtherPlayers;