import axios from 'axios';
import tyhja from '../images/tyhja.png';
import kenka from '../images/kenka.png';
import tahti from '../images/tahti.png';
import rosvo from '../images/rosvo.png';
import keltainen from '../images/keltainen.png';
import vihrea from '../images/vihrea.png';
import punainen from '../images/punainen.png';

//asettaa kuvat kuhunkin tokeniin
const setPicturesToTokens = (tokens) => {
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
    return tokens;
};

const shuffleTokens = (tokens) => {
    for (let i = tokens.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i +1));
        [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
    }
};

const getAllLandingTokens = async () => {
    const res = await axios.get('/landingTokens');
    shuffleTokens(res.data);
    const tokens = setPicturesToTokens(res.data);
    return tokens;
};

const createLandingTokens = async (tokens) => {
    const res = await axios.post('/landingTokens', tokens);
    return res.data;
};

const removeAllLandingTokens = async () => {
    const res = await axios.delete('/landingTokens');
    return res.data;
};

export default {
    getAllLandingTokens,
    createLandingTokens,
    removeAllLandingTokens
};