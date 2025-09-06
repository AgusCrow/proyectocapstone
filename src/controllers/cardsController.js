import cardService from '../services/cardService.js';


// Crear una nueva tarjeta
const createCard = async (req, res) => {
  try {
    const { color, value, type } = req.body;
    const coloresValidos = ['red', 'yellow', 'green', 'blue', 'black'];
    const tiposValidos = ['normal', 'special'];
    if (!color || !value || !type) {
      return res.status(400).json({ error: 'color, value y type son campos requeridos' });
    }
    if (!coloresValidos.includes(color)) {
      return res.status(400).json({ error: 'Color no válido' });
    }
    if (!tiposValidos.includes(type)) {
      return res.status(400).json({ error: 'Tipo no válido' });
    }
    const card = await cardService.createCard({ color, value, type });
    res.status(201).json(card);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al crear tarjeta' });
  }
};

// Obtener una tarjeta por ID
const getCard = async (req, res) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al obtener tarjeta' });
  }
};

// Actualizar una tarjeta
const updateCard = async (req, res) => {
  try {
    const { color, value, type } = req.body;
    const coloresValidos = ['red', 'yellow', 'green', 'blue', 'black'];
    const tiposValidos = ['normal', 'special'];
    if (color && !coloresValidos.includes(color)) {
      return res.status(400).json({ error: 'Color no válido' });
    }
    if (type && !tiposValidos.includes(type)) {
      return res.status(400).json({ error: 'Tipo no válido' });
    }
    const card = await cardService.updateCard(req.params.id, { color, value, type });
    if (!card) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al actualizar tarjeta' });
  }
};

// Eliminar una tarjeta
const deleteCard = async (req, res) => {
  try {
    const deleted = await cardService.deleteCard(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json({ message: 'Tarjeta eliminada exitosamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al eliminar tarjeta' });
  }
};

// Listar todas las tarjetas
const listCards = async (req, res) => {
  try {
    const cards = await cardService.listCards();
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al listar tarjetas' });
  }
};

export { createCard, getCard, updateCard, deleteCard, listCards };