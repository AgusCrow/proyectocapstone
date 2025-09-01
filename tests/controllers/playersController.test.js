import { compose, prop, path, identity } from 'ramda';

jest.mock('../../src/services/playerService.js', () => ({
  __esModule: true,
  default: {
    createPlayer: jest.fn(),
    getPlayerById: jest.fn(),
    updatePlayer: jest.fn(),
    deletePlayer: jest.fn(),
    listPlayers: jest.fn(),
    isEmailUnique: jest.fn(),
    isUsernameUnique: jest.fn()
  }
}));

// Funciones puras para testing
const createMockRequest = (body = {}, params = {}) => ({
  body,
  params,
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Importar después del mock
import playerService from '../../src/services/playerService.js';
import playersController from '../../src/controllers/playersController.js';

describe('Players Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlayer', () => {
    it('debería crear un jugador exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = createMockResponse();
      const mockPlayer = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      playerService.listPlayers.mockResolvedValue([]);
      playerService.createPlayer.mockResolvedValue(mockPlayer);

      // Act
      await playersController.createPlayer(req, res);

      // Assert
      expect(playerService.createPlayer).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: mockPlayer.id,
        username: mockPlayer.username,
        email: mockPlayer.email,
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt
      });
    });

    it('debería retornar error 400 cuando faltan campos requeridos', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'testuser'
        // Falta email y password
      });
      const res = createMockResponse();

      // Act
      await playersController.createPlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos los campos son requeridos: username, email, password'
      });
    });

    it('debería retornar error 400 cuando el email ya está registrado', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = createMockResponse();
      const existingPlayers = [{ email: 'test@example.com' }];
      playerService.listPlayers.mockResolvedValue(existingPlayers);

      // Act
      await playersController.createPlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El email ya está registrado'
      });
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = createMockResponse();
      playerService.listPlayers.mockRejectedValue(new Error('Database error'));

      // Act
      await playersController.createPlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear jugador'
      });
    });
  });

  describe('getPlayer', () => {
    it('debería obtener un jugador exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayer = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      playerService.getPlayerById.mockResolvedValue(mockPlayer);

      // Act
      await playersController.getPlayer(req, res);

      // Assert
      expect(playerService.getPlayerById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        id: mockPlayer.id,
        username: mockPlayer.username,
        email: mockPlayer.email,
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt
      });
    });

    it('debería retornar error 404 cuando el jugador no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      playerService.getPlayerById.mockResolvedValue(null);

      // Act
      await playersController.getPlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Jugador no encontrado'
      });
    });
  });

  describe('updatePlayer', () => {
    it('debería actualizar un jugador exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'updateduser',
        email: 'updated@example.com'
      }, { id: '1' });
      const res = createMockResponse();
      const mockPlayer = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const mockUpdatedPlayer = { 
        id: 1, 
        username: 'updateduser', 
        email: 'updated@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      playerService.getPlayerById.mockResolvedValue(mockPlayer);
      playerService.listPlayers.mockResolvedValue([]);
      playerService.updatePlayer.mockResolvedValue(mockUpdatedPlayer);

      // Act
      await playersController.updatePlayer(req, res);

      // Assert
      expect(playerService.updatePlayer).toHaveBeenCalledWith('1', {
        username: 'updateduser',
        email: 'updated@example.com'
      });
      expect(res.json).toHaveBeenCalledWith({
        id: mockUpdatedPlayer.id,
        username: mockUpdatedPlayer.username,
        email: mockUpdatedPlayer.email,
        createdAt: mockUpdatedPlayer.createdAt,
        updatedAt: mockUpdatedPlayer.updatedAt
      });
    });

    it('debería retornar error 404 cuando el jugador no existe', async () => {
      // Arrange
      const req = createMockRequest({
        username: 'updateduser'
      }, { id: '999' });
      const res = createMockResponse();
      playerService.getPlayerById.mockResolvedValue(null);

      // Act
      await playersController.updatePlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Jugador no encontrado'
      });
    });
  });

  describe('deletePlayer', () => {
    it('debería eliminar un jugador exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayer = { 
        id: 1, 
        username: 'testuser',
        update: jest.fn().mockResolvedValue(true)
      };
      playerService.getPlayerById.mockResolvedValue(mockPlayer);

      // Act
      await playersController.deletePlayer(req, res);

      // Assert
      expect(playerService.deletePlayer).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Jugador eliminado exitosamente'
      });
    });

    it('debería retornar error 404 cuando el jugador no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      playerService.getPlayerById.mockResolvedValue(null);

      // Act
      await playersController.deletePlayer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Jugador no encontrado'
      });
    });
  });

  describe('listPlayers', () => {
    it('debería listar todos los jugadores exitosamente', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      const mockPlayers = [
        { id: 1, username: 'user1', email: 'user1@example.com', activo: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, username: 'user2', email: 'user2@example.com', activo: true, createdAt: new Date(), updatedAt: new Date() }
      ];
      playerService.listPlayers.mockResolvedValue(mockPlayers);

      // Act
      await playersController.listPlayers(req, res);

      // Assert
      expect(playerService.listPlayers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPlayers.map(p => ({
        id: p.id,
        username: p.username,
        email: p.email,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })));
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      playerService.listPlayers.mockRejectedValue(new Error('Database error'));

      // Act
      await playersController.listPlayers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al listar jugadores'
      });
    });
  });
}); 