import mapSpotsService from '../services/mapSpotsService';

const landingSpotReducer = (state = [], action) => {
    switch(action.type) {
    case 'INIT_LANDINGSPOTS':
        return action.data;
    case 'REVEAL_LANDINGSPOT':
        action.data.revealed = true;
        return state.map(s => s.id !== action.data.id ? s : action.data);
    case 'HIDE_LANDINGSPOTS':
        return action.data;
    default: return state;
    }
};

export const initLandingSpots = () => {
    return async dispatch => {
        const spots = await mapSpotsService.getLandingSpots();
        spots.forEach(spot => spot.revealed = false);
        dispatch({
            type: 'INIT_LANDINGSPOTS',
            data: spots
        });
    };
};

export const revealLandingSpot = (spot) => {
    return {
        type: 'REVEAL_LANDINGSPOT',
        data: spot
    };
};

export const hideLandingSpots = (spots) => {
    return dispatch => {
        spots.forEach(spot => spot.revealed = false);
        dispatch({
            type: 'HIDE_LANDINGSPOTS',
            data: spots
        });
    };
};

export default landingSpotReducer;