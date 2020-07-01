import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    // palette: {
    //     primary: {

    //     },
    //     secondary: {
            
    //     }
    // },
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