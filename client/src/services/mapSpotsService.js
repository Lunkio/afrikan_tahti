import axios from 'axios';

const getLandingSpots = async () => {
    const res = await axios.get('/landingSpots');
    return res.data;
};

const getLandRoutes = async () => {
    const res = await axios.get('/landRoutes');
    return res.data;
};

const getSeaRoutes = async () => {
    const res = await axios.get('/seaRoutes');
    return res.data;
};

const getStartPoints = async () => {
    const res = await axios.get('/startPoints');
    return res.data;
};

const getAllLandingTokens = async () => {
    const res = await axios.get('/landingTokens');
    return res.data;
};

const createLandingTokens = async (tokens) => {
    const res = await axios.post('/landingTokens', tokens);
    return res.data;
};

const removeAllLandingTokens = async () => {
    const res = await axios.delete('/landingTokens');
    return res.data;
};

const createStartPoint = async (point) => {
    const res = await axios.post('/startPoints', point);
    return res.data;
};

const createLandRoute = async (point) => {
    const res = await axios.post('/landRoutes', point);
    return res.data;
};

const createSeaRoute = async (point) => {
    const res = await axios.post('/seaRoutes', point);
    return res.data;
};

const createLandingSpot = async (point) => {
    const res = await axios.post('/landingSpots', point);
    return res.data;
};

export default {
    getLandingSpots,
    getLandRoutes,
    getSeaRoutes,
    getStartPoints,
    getAllLandingTokens,
    createLandingTokens,
    removeAllLandingTokens,
    createStartPoint,
    createLandRoute,
    createSeaRoute,
    createLandingSpot
};