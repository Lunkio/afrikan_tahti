import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './styles/FontAwesomeIcons';
import { store } from './store';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './styles/theme';
import io from 'socket.io-client';

// tällä voit klikkailemalla lisätä kuvia/spotteja pelikentälle, laita vain json-server päälle ja vaihda mapSpotsServicen funktio oikeaan spottiin
// import mapSpotsService from './services/mapSpotsService';
// let canvas = document.getElementById('root');
// let updater = 0;
// const onMouseClick = async (event) => {
//     const newSpot = {
//         coordX: event.clientX -538,
//         coordY: event.clientY
//     };
//     try {
//         await mapSpotsService.createStartPoint(newSpot);
//         updater++;
//         renderApp();
//     } catch (e) {
//         console.log('error', e);
//     }
// };
// canvas.addEventListener('mousedown', onMouseClick);

export let socket;
// eslint-disable-next-line
if (process.env.NODE_ENV === 'development') {
    socket = io(':3001');
} else {
    socket = io('https://afrikan-tahti.herokuapp.com/');
}
// export let socket = io(':3001');
// export let socket = io('https://afrikan-tahti.herokuapp.com/');

const renderApp = () => {
    ReactDOM.render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <App 
                    // updater={updater}
                />
            </ThemeProvider>
        </Provider>,
        document.getElementById('root')
    );
};
renderApp();