import scoreService from '../services/scoreService.js';

// Crear un nuevo score
const createScore = async (req, res) => {
  try {
    const { playerId, gameId, points } = req.body;
    if (!playerId || !gameId) {
      return res.status(400).json({ error: 'playerId y gameId son campos requeridos' });
    }
    const score = await scoreService.createScore({ playerId, gameId, points });
    res.status(201).json(score);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al crear score' });
  }
};

// Obtener un score por ID
const getScore = async (req, res) => {
  try {
    const score = await scoreService.getScoreById(req.params.id);
    if (!score) return res.status(404).json({ error: 'Score no encontrado' });
    res.json(score);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al obtener score' });
  }
};

// Actualizar un score
const updateScore = async (req, res) => {
  try {
    const { points } = req.body;
    const score = await scoreService.updateScore(req.params.id, { points });
    if (!score) return res.status(404).json({ error: 'Score no encontrado' });
    res.json(score);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al actualizar score' });
  }
};

// Eliminar un score
const deleteScore = async (req, res) => {
  try {
    const deleted = await scoreService.deleteScore(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Score no encontrado' });
    res.json({ message: 'Score eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al eliminar score' });
  }
};

// Listar todos los scores
const listScores = async (req, res) => {
  try {
    const scores = await scoreService.listScores();
    res.json(scores);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al listar scores' });
  }
};

export default { createScore, getScore, updateScore, deleteScore, listScores };