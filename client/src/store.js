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

const reducers = combineReducers({
    user: userReducer,
    alert: alertReducer,
    players: playersReducer,
    landingTokens: landingTokenReducer,
    landingSpots: landingSpotReducer,
    startPoints: startPointReducer,
    landRoutes: landRouteReducer,
    seaRoutes: seaRouteReducer,
    starIsFound: starIsFoundReducer
});

export const store = createStore(reducers, applyMiddleware(thunk));