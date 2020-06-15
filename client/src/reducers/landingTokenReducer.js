const landingTokenReducer = (state = [], action) => {
    switch(action.type) {
    case 'INIT_TOKENS':
        return action.data;
    case 'REMOVE_LANDINGTOKENS':
        return [];
    default: return state;
    }
};

export const initLandingTokens = (tokens) => {
    return {
        type: 'INIT_TOKENS',
        data: tokens
    };
};

export const removeLandingTokens = () => {
    return {
        type: 'REMOVE_LANDINGTOKENS'
    };
};

export default landingTokenReducer;