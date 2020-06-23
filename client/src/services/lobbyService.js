import axios from 'axios';

const getAllLobbies = async () => {
    const res = await axios.get('/lobbies');
    return res.data;
};

const getSingleLobby = async (lobby) => {
    const res = await axios.get(`/lobbies/${lobby.id}`);
    return res.data;
};

const createLobby = async (lobby) => {
    const res = await axios.post('/lobbies', lobby);
    return res.data;
};

const editLobby = async (lobby) => {
    const res = await axios.put(`/lobbies/${lobby.id}`, lobby);
    return res.data;
};

const removeOneLobby = async (lobby) => {
    const res = await axios.delete(`/lobbies/single/${lobby.id}`);
    return res.data;
};

const removeAllLobbies = async () => {
    const res = await axios.delete('/lobbies');
    return res.data;
};

export default {
    getAllLobbies,
    getSingleLobby,
    createLobby,
    editLobby,
    removeOneLobby,
    removeAllLobbies
};