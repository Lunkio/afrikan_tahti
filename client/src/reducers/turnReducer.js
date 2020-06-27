const turnReducer = (state = false, action) => {
    switch (action.type) {
    case 'TURN_TRUE':
        return true;
    case 'TURN_FALSE':
        return false;
    default: return state;
    }
};

export const turnToTrue = () => {
    return {
        type: 'TURN_TRUE'
    };
};

export const turnToFalse = () => {
    return {
        type: 'TURN_FALSE'
    };
};

export default turnReducer;