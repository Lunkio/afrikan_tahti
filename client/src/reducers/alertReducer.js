const initAlert = {
    open: false,
    text: ''
};

const alertReducer = (state = initAlert, action) => {
    switch(action.type) {
    case 'SET_ALERT':
        return action.data;
    case 'REMOVE_ALERT':
        return initAlert;
    default: return state;
    }
};

export const setAlert = (alertText) => {
    return dispatch => {
        const newAlert = {
            open: true,
            text: alertText
        };
        dispatch({
            type: 'SET_ALERT',
            data: newAlert
        });
    };
};

export const closeAlert = () => {
    return {
        type: 'REMOVE_ALERT'
    };
};

export default alertReducer;