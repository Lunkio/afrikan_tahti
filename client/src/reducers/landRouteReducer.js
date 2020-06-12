import mapSpotsService from '../services/mapSpotsService';

const landRouteReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_LANDROUTES':
        return action.data;
    default: return state;
    }
};

export const initLandRoutes = () => {
    return async dispatch => {
        const landRoutes = await mapSpotsService.getLandRoutes();
        dispatch({
            type: 'INIT_LANDROUTES',
            data: landRoutes
        });
    };
};

export default landRouteReducer;