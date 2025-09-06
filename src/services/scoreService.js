import { Score } from '../orm/index.js';
import functional from '../utils/functional.js';
const { map, identity } = functional;

// Crear un nuevo score
const createScore = async (data) => {
    return await Score.create({
        playerId: data.playerId,
        gameId: data.gameId,
        points: data.points,
        position: data.position || 1
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
    await score.update(data);
    const updatedScore = await Score.findByPk(id);
    return updatedScore;
};

// Eliminar score
const deleteScore = async (id) => {
    const score = await Score.findByPk(id);
    if (!score) return false;
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

// Obtener scores por jugador (alias para listScoresByPlayer)
const getScoresByPlayer = async (playerId) => {
    return await listScoresByPlayer(playerId);
};

// Obtener scores por juego (alias para listScoresByGame)
const getScoresByGame = async (gameId) => {
    return await listScoresByGame(gameId);
};

// Obtener los mejores scores
const getTopScores = async (limit = 10) => {
    const scores = await Score.findAll({
        order: [['points', 'DESC']],
        limit: limit
    });
    return map(identity)(scores);
};

// Obtener estadísticas del jugador
const getPlayerStats = async (playerId) => {
    const scores = await Score.findAll({ where: { playerId } });
    
    if (scores.length === 0) {
        return {
            totalGames: 0,
            totalPoints: 0,
            averagePoints: 0,
            winRate: 0
        };
    }
    
    const totalPoints = scores.reduce((sum, score) => sum + score.points, 0);
    const averagePoints = totalPoints / scores.length;
    const wins = scores.filter(score => score.position === 1).length;
    const winRate = (wins / scores.length) * 100;
    
    return {
        totalGames: scores.length,
        totalPoints,
        averagePoints: Math.round(averagePoints * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
    };
};

// Validar datos de score
const validateScoreData = (data) => {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    const requiredFields = ['playerId', 'gameId', 'points'];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            return false;
        }
    }
    
    // Validar que playerId y gameId sean números positivos
    if (typeof data.playerId !== 'number' || data.playerId <= 0) {
        return false;
    }
    
    if (typeof data.gameId !== 'number' || data.gameId <= 0) {
        return false;
    }
    
    // Validar que points sea un número no negativo
    if (typeof data.points !== 'number' || data.points < 0) {
        return false;
    }
    
    // Validar position si está presente
    if (data.position !== undefined && data.position !== null) {
        if (typeof data.position !== 'number' || data.position <= 0) {
            return false;
        }
    }
    
    return true;
};

export default {
    createScore,
    getScoreById,
    updateScore,
    deleteScore,
    listScores,
    listScoresByPlayer,
    listScoresByGame,
    getScoresByPlayer,
    getScoresByGame,
    getTopScores,
    getPlayerStats,
    validateScoreData
};