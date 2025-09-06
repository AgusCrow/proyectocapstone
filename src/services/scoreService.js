import { Score } from '../orm/index.js';
import functional from '../utils/functional.js';
const { map, identity } = functional;

// Crear un nuevo score
const createScore = async (data) => {
    return await Score.create({
        playerId: data.playerId,
        gameId: data.gameId,
        points: data.points
    });
};

// Obtener score por ID
const getScoreById = async (id) => {
    return await Score.findByPk(id);
};

// Actualizar score
const updateScore = async (id, data) => {
    const score = await Score.findByPk(id);
    if (!score) return null;
    return await score.update(data);
};

// Eliminar score
const deleteScore = async (id) => {
    const score = await Score.findByPk(id);
    if (!score) return null;
    await score.destroy();
    return true;
};

// Listar todos los scores
const listScores = async () => {
    const scores = await Score.findAll();
    return map(identity)(scores);
};

// Listar scores por jugador
const listScoresByPlayer = async (playerId) => {
    const scores = await Score.findAll({ where: { playerId } });
    return map(identity)(scores);
};

// Listar scores por juego
const listScoresByGame = async (gameId) => {
    const scores = await Score.findAll({ where: { gameId } });
    return map(identity)(scores);
};

export default {
    createScore,
    getScoreById,
    updateScore,
    deleteScore,
    listScores,
    listScoresByPlayer,
    listScoresByGame
};