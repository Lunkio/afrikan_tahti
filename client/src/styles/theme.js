import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    typography: {
        fontFamily: [
            'Chelsea Market',
            'cursive'
        ].join(','),
        button: {
            textTransform: 'none'
        }
    }
});

export default theme;