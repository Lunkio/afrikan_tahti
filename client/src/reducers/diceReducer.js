const diceReducer = (state = 1, action) => {
    switch (action.type) {
    case 'DICE_THROW':
        return action.data;
    default: return state;
    }
};

export const throwDice = (amount) => {
    return {
        type: 'DICE_THROW',
        data: amount
    };
};

export default diceReducer;