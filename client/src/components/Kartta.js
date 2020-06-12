import React from 'react';
import Karttakuva from '../images/kartta.jpg';

const Kartta = () => {

    return (
        <div>
            <div className='map-image-container'>
                <img src={Karttakuva} alt='pelilauta' />
            </div>
        </div>
    );
};

export default Kartta;