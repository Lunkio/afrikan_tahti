import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { closeAlert } from '../reducers/alertReducer';

const Alert = (props) => {
    return <MuiAlert elevation={6} variant='filled' {...props} />;
};

const AlertMessage = () => {
    const dispatch = useDispatch();
    const alert = useSelector(state => state.alert);

    const handleClose = (_event, reason) => {
        if (reason === 'clickaway') { 
            return;
        }
        dispatch(closeAlert());
    };

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
            }}
            open={alert.open}
            autoHideDuration={5000}
            onClose={handleClose}
        >
            <Alert onClose={handleClose} severity='info'>
                {alert.text}
            </Alert>
        </Snackbar>
    );
};

export default AlertMessage;