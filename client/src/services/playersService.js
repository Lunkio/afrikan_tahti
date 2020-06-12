import axios from 'axios';

const getAllPlayers = async () => {
    const res = await axios.get('/players');
    return res.data;
};

const addNewPlayer = async (player) => {
    const res = await axios.post('/players', player);
    return res.data;
};

const editPlayer = async (player) => {
    const res = await axios.put(`/players/${player.id}`, player);
    return res.data;
};

const removeOnePlayer = async (player) => {
    const res = await axios.delete(`/players/single/${player.id}`);
    return res.data;
};

const removeAllPlayers = async () => {
    const res = await axios.delete('/players');
    return res.data;
};

export default {
    getAllPlayers,
    addNewPlayer,
    editPlayer,
    removeOnePlayer,
    removeAllPlayers
};