import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import userReducer from './reducers/userReducer';
import alertReducer from './reducers/alertReducer';
import playersReducer from './reducers/playersReducer';
import landingTokenReducer from './reducers/landingTokenReducer';
import landingSpotReducer from './reducers/landingSpotReducer';
import startPointReducer from './reducers/startPointReducer';
import landRouteReducer from './reducers/landRouteReducer';
import seaRouteReducer from './reducers/seaRouteReducer';
import starIsFoundReducer from './reducers/starIsFoundReducer';
import lobbyReducer from './reducers/lobbyReducer';
import inGamePlayersReducer from './reducers/inGamePlayersReducer';
import turnReducer from './reducers/turnReducer';
import timerReducer from './reducers/timerReducer';
import diceReducer from './reducers/diceReducer';

const reducers = combineReducers({
    user: userReducer,
    alert: alertReducer,
    players: playersReducer,
    inGamePlayers: inGamePlayersReducer,
    landingTokens: landingTokenReducer,
    landingSpots: landingSpotReducer,
    startPoints: startPointReducer,
    landRoutes: landRouteReducer,
    seaRoutes: seaRouteReducer,
    starIsFound: starIsFoundReducer,
    lobbies: lobbyReducer,
    turn: turnReducer,
    timer: timerReducer,
    dice: diceReducer
});

export const store = createStore(reducers, applyMiddleware(thunk));