const timerReducer = (state = { counter: 45, player: null }, action) => {
    switch (action.type) {
    case 'SET_TIMER':
        return { counter: 45, player: action.data };
    case 'DECREASE_TIMER':
        if (state.counter === action.data.amount +1) {
            return { counter: action.data.amount, player: action.data.player };
        } else {
            return { counter: state.counter, player: action.data.player };
        }
    default: return state;
    }
};

export const setTimer = (player) => {
    return {
        type: 'SET_TIMER',
        data: player
    };
};

export const decreaseTimer = (amount, player) => {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: 'DECREASE_TIMER',
                data: {
                    amount,
                    player
                }
            });
        }, 1000);
    };
};

export default timerReducer;