import { createStyles, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() =>
    createStyles({
        yellowButton: {
            backgroundColor: '#FC9E4F',
            color: 'black'
        },
        lightBlueButton: {
            backgroundColor: '#DEEAF7',
            color: 'black'
        }
    }),
);