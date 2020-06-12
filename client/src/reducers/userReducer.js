const userReducer = (state = null, action) => {
    switch (action.type) {
    case 'NEW_USER':
        return action.data;
    case 'LOGOUT_USER':
        return null;
    default: return state;
    }
};

export const newUser = (user) => {
    return dispatch => {
        window.localStorage.setItem('loggedInUser', JSON.stringify(user));
        dispatch({
            type: 'NEW_USER',
            data: user
        });
    };
};

export const logoutUser = () => {
    return dispatch => {
        window.localStorage.removeItem('loggedInUser');
        dispatch({
            type: 'LOGOUT_USER'
        });
    };
};

export const initUser = () => {
    return dispatch => {
        const loggedInUser = window.localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            dispatch({
                type: 'NEW_USER',
                data: user
            });
        }
    };
};

export default userReducer;