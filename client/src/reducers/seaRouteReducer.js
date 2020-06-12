import mapSpotsService from '../services/mapSpotsService';

const seaRouteReducer = (state = [], action) => {
    switch (action.type) {
    case 'INIT_SEAROUTES':
        return action.data;
    default: return state;
    }
};

export const initSeaRoutes = () => {
    return async dispatch => {
        const seaRoutes = await mapSpotsService.getSeaRoutes();
        seaRoutes.forEach(v => v.seaRoute = true);
        dispatch({
            type: 'INIT_SEAROUTES',
            data: seaRoutes
        });
    };
};

export default seaRouteReducer;