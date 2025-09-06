import playerService from '../services/playerService.js';

// Crear un nuevo jugador
const createPlayer = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos: username, email, password' });
    }
    // Validar unicidad de email
    const existing = await playerService.listPlayers();
    if (existing.some(p => p.email === email)) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const player = await playerService.createPlayer({ username, email, password });
    res.status(201).json({
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al crear jugador' });
  }
};

// Obtener un jugador por ID
const getPlayer = async (req, res) => {
  try {
    const player = await playerService.getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json({
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al obtener jugador' });
  }
};

// Actualizar un jugador
const updatePlayer = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const player = await playerService.getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Jugador no encontrado' });
    // Validar unicidad de email si se actualiza
    if (email && email !== player.email) {
      const existing = await playerService.listPlayers();
      if (existing.some(p => p.email === email)) {
        return res.status(400).json({ error: 'El email ya está registrado por otro jugador' });
      }
    }
    const updated = await playerService.updatePlayer(req.params.id, { username, email, password });
    res.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al actualizar jugador' });
  }
};

// Eliminar un jugador (soft delete)
const deletePlayer = async (req, res) => {
  try {
    const player = await playerService.getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Jugador no encontrado' });
    // Soft delete: actualizar un campo "activo" si existe, si no, eliminar físicamente
    if ('activo' in player) {
      await player.update({ activo: false });
      return res.json({ message: 'Jugador eliminado (inactivado) exitosamente' });
    } else {
      await playerService.deletePlayer(req.params.id);
      return res.json({ message: 'Jugador eliminado exitosamente' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Error interno al eliminar jugador' });
  }
};

// Listar todos los jugadores activos
const listPlayers = async (req, res) => {
  try {
    const players = await playerService.listPlayers();
    // Si existe campo activo, filtrar solo activos
    const activos = players.filter(p => p.activo === undefined || p.activo === true);
    res.json(activos.map(p => ({
      id: p.id,
      username: p.username,
      email: p.email,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })));
  } catch (e) {
    res.status(500).json({ error: 'Error interno al listar jugadores' });
  }
};

export default { createPlayer, getPlayer, updatePlayer, deletePlayer, listPlayers };