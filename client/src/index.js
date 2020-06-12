import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { store } from './store';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import io from 'socket.io-client';

// tällä voit klikkailemalla lisätä kuvia/spotteja pelikentälle
// import mapSpotsService from './services/mapSpotsService';
// let canvas = document.getElementById('root');
// let updater = 0;
// const onMouseClick = async (event) => {
//     const newSpot = {
//         coordX: event.pageX,
//         coordY: event.pageY
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

export let socket = io(':3001');

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