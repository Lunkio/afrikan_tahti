import mapSpotsService from '../services/mapSpotsService';

const startPointReducer = (state = [], action) => {
    switch(action.type) {
    case 'INIT_STARTPOINTS':
        return action.data;
    default: return state;
    }
};

export const initStartPoints = () => {
    return async dispatch => {
        const startPoints = await mapSpotsService.getStartPoints();
        dispatch({
            type: 'INIT_STARTPOINTS',
            data: startPoints
        });
    };
};

export default startPointReducer;