import React from 'react';
import styled from 'styled-components';
import Karttakuva from '../images/kartta.jpg';

const Kartta = () => {

    return (
        <MapStyle>
            <img src={Karttakuva} alt='pelilauta' />
        </MapStyle>
    );
};

const MapStyle = styled.div`
    z-index: 0;
`;

export default Kartta;