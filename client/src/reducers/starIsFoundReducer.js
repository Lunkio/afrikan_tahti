const starIsFoundReducer = (state = false, action) => {
    switch (action.type) {
    case 'STAR_FOUND':
        return true;
    default: return state;
    }
};

export const foundStar = () => {
    return {
        type: 'STAR_FOUND'
    };
};

export default starIsFoundReducer;