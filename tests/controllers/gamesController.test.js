
jest.mock('../../src/services/gameService.js', () => ({
  __esModule: true,
  default: {
    createGame: jest.fn(),
    getGameById: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
    listGames: jest.fn(),
    addPlayerToGame: jest.fn(),
    removePlayerFromGame: jest.fn(),
    startGame: jest.fn(),
    endGame: jest.fn(),
    getPlayersInGame: jest.fn()
  }
}));

// Funciones puras para testing
const createMockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user,
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
import gamesController from '../../src/controllers/gamesController.js';
import gameService from '../../src/services/gameService.js';

describe('Games Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('debería crear un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Test Game', 
        rules: 'Test rules',
        maxPlayers: 4,
        status: 'waiting'
      };
      gameService.createGame.mockResolvedValue(mockGame);

      // Act
      await gamesController.createGame(req, res);

      // Assert
      expect(gameService.createGame).toHaveBeenCalledWith({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      const res = createMockResponse();
      gameService.createGame.mockRejectedValue(new Error('Database error'));

      // Act
      await gamesController.createGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear juego'
      });
    });
  });

  describe('getGame', () => {
    it('debería obtener un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Test Game', 
        status: 'waiting' 
      };
      gameService.getGameById.mockResolvedValue(mockGame);

      // Act
      await gamesController.getGame(req, res);

      // Assert
      expect(gameService.getGameById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      gameService.getGameById.mockResolvedValue(null);

      // Act
      await gamesController.getGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('updateGame', () => {
    it('debería actualizar un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        name: 'Updated Game',
        rules: 'Updated rules'
      }, { id: '1' });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Updated Game', 
        rules: 'Updated rules' 
      };
      gameService.updateGame.mockResolvedValue(mockGame);

      // Act
      await gamesController.updateGame(req, res);

      // Assert
      expect(gameService.updateGame).toHaveBeenCalledWith('1', {
        name: 'Updated Game',
        rules: 'Updated rules'
      });
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      // Arrange
      const req = createMockRequest({
        name: 'Updated Game'
      }, { id: '999' });
      const res = createMockResponse();
      gameService.updateGame.mockResolvedValue(null);

      // Act
      await gamesController.updateGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('deleteGame', () => {
    it('debería eliminar un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      gameService.deleteGame.mockResolvedValue(true);

      // Act
      await gamesController.deleteGame(req, res);

      // Assert
      expect(gameService.deleteGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Juego eliminado exitosamente'
      });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      gameService.deleteGame.mockResolvedValue(false);

      // Act
      await gamesController.deleteGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('listGames', () => {
    it('debería listar todos los juegos exitosamente', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      const mockGames = [
        { id: 1, name: 'Game 1', status: 'waiting' },
        { id: 2, name: 'Game 2', status: 'in_progress' }
      ];
      gameService.listGames.mockResolvedValue(mockGames);

      // Act
      await gamesController.listGames(req, res);

      // Assert
      expect(gameService.listGames).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockGames);
    });
  });

  describe('joinGame', () => {
    it('debería unir un jugador a un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.addPlayerToGame.mockResolvedValue(true);

      // Act
      await gamesController.joinGame(req, res);

      // Assert
      expect(gameService.addPlayerToGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario unido al juego exitosamente'
      });
    });

    it('debería retornar error 409 cuando el usuario ya está en el juego', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.addPlayerToGame.mockResolvedValue('already_joined');

      // Act
      await gamesController.joinGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El usuario ya está en el juego'
      });
    });
  });

  describe('leaveGame', () => {
    it('debería sacar un jugador de un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.removePlayerFromGame.mockResolvedValue(true);

      // Act
      await gamesController.leaveGame(req, res);

      // Assert
      expect(gameService.removePlayerFromGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario salió del juego exitosamente'
      });
    });
  });

  describe('startGame', () => {
    it('debería iniciar un juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue(true);

      // Act
      await gamesController.startGame(req, res);

      // Assert
      expect(gameService.startGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Juego iniciado exitosamente'
      });
    });

    it('debería retornar error 403 cuando el usuario no es el creador', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue('not_creator');

      // Act
      await gamesController.startGame(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Solo el creador puede iniciar el juego'
      });
    });
  });

  describe('getGameState', () => {
    it('debería obtener el estado del juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        status: 'in_progress' 
      };
      gameService.getGameById.mockResolvedValue(mockGame);

      // Act
      await gamesController.getGameState(req, res);

      // Assert
      expect(gameService.getGameById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        game_id: mockGame.id,
        state: mockGame.status
      });
    });
  });

  describe('getPlayersInGame', () => {
    it('debería obtener los jugadores en el juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayers = [
        { username: 'player1' },
        { username: 'player2' }
      ];
      gameService.getPlayersInGame.mockResolvedValue(mockPlayers);

      // Act
      await gamesController.getPlayersInGame(req, res);

      // Assert
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        players: ['player1', 'player2']
      });
    });
  });

  describe('getCurrentPlayer', () => {
    it('debería obtener el jugador actual exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayers = [
        { username: 'player1' },
        { username: 'player2' }
      ];
      gameService.getPlayersInGame.mockResolvedValue(mockPlayers);

      // Act
      await gamesController.getCurrentPlayer(req, res);

      // Assert
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        current_player: 'player1'
      });
    });
  });

  describe('getTopCard', () => {
    it('debería obtener la carta superior exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();

      // Act
      await gamesController.getTopCard(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        top_card: 'Red 5'
      });
    });
  });

  describe('getGameScores', () => {
    it('debería obtener los scores del juego exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayers = [
        { username: 'player1' },
        { username: 'player2' }
      ];
      gameService.getPlayersInGame.mockResolvedValue(mockPlayers);

      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.67) // player1: Math.floor(0.67 * 200) = 134
        .mockReturnValueOnce(0.45); // player2: Math.floor(0.45 * 200) = 90

      // Act
      await gamesController.getGameScores(req, res);

      // Assert
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        scores: {
          'player1': 134,
          'player2': 90
        }
      });

      // Restore Math.random
      Math.random = originalRandom;
    });
  });
}); 