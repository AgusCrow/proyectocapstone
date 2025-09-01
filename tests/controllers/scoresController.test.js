
jest.mock('../../src/services/scoreService.js', () => ({
  __esModule: true,
  default: {
    createScore: jest.fn(),
    getScoreById: jest.fn(),
    updateScore: jest.fn(),
    deleteScore: jest.fn(),
    listScores: jest.fn(),
    getScoresByPlayer: jest.fn(),
    getScoresByGame: jest.fn(),
    getTopScores: jest.fn()
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
import scoresController from '../../src/controllers/scoresController.js';
import scoreService from '../../src/services/scoreService.js';

describe('Scores Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createScore', () => {
    it('debería crear un score exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        playerId: 1,
        gameId: 1,
        points: 100
      });
      const res = createMockResponse();
      const mockScore = { 
        id: 1, 
        playerId: 1, 
        gameId: 1, 
        points: 100 
      };
      scoreService.createScore.mockResolvedValue(mockScore);

      // Act
      await scoresController.createScore(req, res);

      // Assert
      expect(scoreService.createScore).toHaveBeenCalledWith({
        playerId: 1,
        gameId: 1,
        points: 100
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockScore);
    });

    it('debería retornar error 400 cuando faltan campos requeridos', async () => {
      // Arrange
      const req = createMockRequest({
        playerId: 1
        // Falta gameId
      });
      const res = createMockResponse();

      // Act
      await scoresController.createScore(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'playerId y gameId son campos requeridos'
      });
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest({
        playerId: 1,
        gameId: 1,
        points: 100
      });
      const res = createMockResponse();
      scoreService.createScore.mockRejectedValue(new Error('Database error'));

      // Act
      await scoresController.createScore(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear score'
      });
    });
  });

  describe('getScore', () => {
    it('debería obtener un score exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockScore = { 
        id: 1, 
        playerId: 1, 
        gameId: 1, 
        points: 100 
      };
      scoreService.getScoreById.mockResolvedValue(mockScore);

      // Act
      await scoresController.getScore(req, res);

      // Assert
      expect(scoreService.getScoreById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockScore);
    });

    it('debería retornar error 404 cuando el score no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      scoreService.getScoreById.mockResolvedValue(null);

      // Act
      await scoresController.getScore(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Score no encontrado'
      });
    });
  });

  describe('updateScore', () => {
    it('debería actualizar un score exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        points: 150
      }, { id: '1' });
      const res = createMockResponse();
      const mockScore = { 
        id: 1, 
        playerId: 1, 
        gameId: 1, 
        points: 150 
      };
      scoreService.updateScore.mockResolvedValue(mockScore);

      // Act
      await scoresController.updateScore(req, res);

      // Assert
      expect(scoreService.updateScore).toHaveBeenCalledWith('1', {
        points: 150
      });
      expect(res.json).toHaveBeenCalledWith(mockScore);
    });

    it('debería retornar error 404 cuando el score no existe', async () => {
      // Arrange
      const req = createMockRequest({
        points: 150
      }, { id: '999' });
      const res = createMockResponse();
      scoreService.updateScore.mockResolvedValue(null);

      // Act
      await scoresController.updateScore(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Score no encontrado'
      });
    });
  });

  describe('deleteScore', () => {
    it('debería eliminar un score exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      scoreService.deleteScore.mockResolvedValue(true);

      // Act
      await scoresController.deleteScore(req, res);

      // Assert
      expect(scoreService.deleteScore).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Score eliminado exitosamente'
      });
    });

    it('debería retornar error 404 cuando el score no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      scoreService.deleteScore.mockResolvedValue(false);

      // Act
      await scoresController.deleteScore(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Score no encontrado'
      });
    });
  });

  describe('listScores', () => {
    it('debería listar todos los scores exitosamente', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100 },
        { id: 2, playerId: 2, gameId: 1, points: 80 }
      ];
      scoreService.listScores.mockResolvedValue(mockScores);

      // Act
      await scoresController.listScores(req, res);

      // Assert
      expect(scoreService.listScores).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockScores);
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      scoreService.listScores.mockRejectedValue(new Error('Database error'));

      // Act
      await scoresController.listScores(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al listar scores'
      });
    });
  });
}); 