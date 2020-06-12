import mapSpotsService from '../services/mapSpotsService';
import tyhja from '../images/tyhja.png';
import kenka from '../images/kenka.png';
import tahti from '../images/tahti.png';
import rosvo from '../images/rosvo.png';
import keltainen from '../images/keltainen.png';
import vihrea from '../images/vihrea.png';
import punainen from '../images/punainen.png';

const landingTokenReducer = (state = [], action) => {
    switch(action.type) {
    case 'INIT_TOKENS':
        return action.data;
    case 'REMOVE_LANDINGTOKENS':
        return [];
    default: return state;
    }
};

export const initLandingTokens = () => {
    return async dispatch => {
        const tokens = await mapSpotsService.getAllLandingTokens();
        //asettaa kuvat kuhunkin tokeniin
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'tyhja') {
                tokens[i].picture = tyhja;
            }
            if (tokens[i].type === 'punainen') {
                tokens[i].picture = punainen;
            }
            if (tokens[i].type === 'vihrea') {
                tokens[i].picture = vihrea;
            }
            if (tokens[i].type === 'keltainen') {
                tokens[i].picture = keltainen;
            }
            if (tokens[i].type === 'rosvo') {
                tokens[i].picture = rosvo;
            }
            if (tokens[i].type === 'kenka') {
                tokens[i].picture = kenka;
            }
            if (tokens[i].type === 'tahti') {
                tokens[i].picture = tahti;
            }
        }
        //asettaa vastaavan landingSpotId:n jotta tokenin voi täsmätä sen kyseiseen landingspottiin
        for (let i = 1; i <= tokens.length; i++) {
            tokens[i -1].landingSpotId = i;
        }
        dispatch ({
            type: 'INIT_TOKENS',
            data: tokens
        });
    };
};

export const removeLandingTokens = () => {
    return {
        type: 'REMOVE_LANDINGTOKENS'
    };
};

export default landingTokenReducer;