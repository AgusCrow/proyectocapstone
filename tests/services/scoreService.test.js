jest.mock('../../src/orm/index.js', () => ({
  __esModule: true,
  Score: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Player: {
    findByPk: jest.fn()
  },
  Game: {
    findByPk: jest.fn()
  }
}));

import { Score } from '../../src/orm/index.js';
import scoreService from '../../src/services/scoreService.js';

describe('Score Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createScore', () => {
    it('debería crear un score exitosamente', async () => {
      // Arrange
      const scoreData = {
        playerId: 1,
        gameId: 1,
        points: 100,
        position: 1
      };
      const mockScore = {
        id: 1,
        ...scoreData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Score.create.mockResolvedValue(mockScore);

      // Act
      const result = await scoreService.createScore(scoreData);

      // Assert
      expect(Score.create).toHaveBeenCalledWith(scoreData);
      expect(result).toEqual(mockScore);
    });

    it('debería manejar errores de validación', async () => {
      // Arrange
      const scoreData = { playerId: 1 }; // Falta gameId, points, position
      Score.create.mockRejectedValue(new Error('Validation error'));

      // Act & Assert
      await expect(scoreService.createScore(scoreData)).rejects.toThrow('Validation error');
    });
  });

  describe('getScoreById', () => {
    it('debería obtener un score por ID exitosamente', async () => {
      // Arrange
      const scoreId = '1';
      const mockScore = {
        id: 1,
        playerId: 1,
        gameId: 1,
        points: 100,
        position: 1
      };
      Score.findByPk.mockResolvedValue(mockScore);

      // Act
      const result = await scoreService.getScoreById(scoreId);

      // Assert
      expect(Score.findByPk).toHaveBeenCalledWith(scoreId);
      expect(result).toEqual(mockScore);
    });

    it('debería retornar null cuando el score no existe', async () => {
      // Arrange
      const scoreId = '999';
      Score.findByPk.mockResolvedValue(null);

      // Act
      const result = await scoreService.getScoreById(scoreId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateScore', () => {
    it('debería actualizar un score exitosamente', async () => {
      // Arrange
      const scoreId = '1';
      const updateData = { points: 150 };
      const mockScore = {
        id: 1,
        playerId: 1,
        gameId: 1,
        points: 150,
        position: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      Score.findByPk.mockResolvedValue(mockScore);

      // Act
      const result = await scoreService.updateScore(scoreId, updateData);

      // Assert
      expect(Score.findByPk).toHaveBeenCalledWith(scoreId);
      expect(mockScore.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockScore);
    });

    it('debería retornar null cuando el score no existe', async () => {
      // Arrange
      const scoreId = '999';
      const updateData = { points: 150 };
      Score.findByPk.mockResolvedValue(null);

      // Act
      const result = await scoreService.updateScore(scoreId, updateData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteScore', () => {
    it('debería eliminar un score exitosamente', async () => {
      // Arrange
      const scoreId = '1';
      const mockScore = {
        id: 1,
        playerId: 1,
        gameId: 1,
        points: 100,
        position: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      Score.findByPk.mockResolvedValue(mockScore);

      // Act
      const result = await scoreService.deleteScore(scoreId);

      // Assert
      expect(Score.findByPk).toHaveBeenCalledWith(scoreId);
      expect(mockScore.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('debería retornar false cuando el score no existe', async () => {
      // Arrange
      const scoreId = '999';
      Score.findByPk.mockResolvedValue(null);

      // Act
      const result = await scoreService.deleteScore(scoreId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('listScores', () => {
    it('debería listar todos los scores exitosamente', async () => {
      // Arrange
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 },
        { id: 2, playerId: 2, gameId: 1, points: 80, position: 2 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.listScores();

      // Assert
      expect(Score.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockScores);
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      Score.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(scoreService.listScores()).rejects.toThrow('Database error');
    });
  });

  describe('getScoresByPlayer', () => {
    it('debería obtener scores por jugador exitosamente', async () => {
      // Arrange
      const playerId = '1';
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 },
        { id: 2, playerId: 1, gameId: 2, points: 80, position: 2 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getScoresByPlayer(playerId);

      // Assert
      expect(Score.findAll).toHaveBeenCalledWith({ where: { playerId } });
      expect(result).toEqual(mockScores);
    });

    it('debería retornar array vacío cuando el jugador no tiene scores', async () => {
      // Arrange
      const playerId = '999';
      Score.findAll.mockResolvedValue([]);

      // Act
      const result = await scoreService.getScoresByPlayer(playerId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getScoresByGame', () => {
    it('debería obtener scores por juego exitosamente', async () => {
      // Arrange
      const gameId = '1';
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 },
        { id: 2, playerId: 2, gameId: 1, points: 80, position: 2 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getScoresByGame(gameId);

      // Assert
      expect(Score.findAll).toHaveBeenCalledWith({ where: { gameId } });
      expect(result).toEqual(mockScores);
    });

    it('debería retornar array vacío cuando el juego no tiene scores', async () => {
      // Arrange
      const gameId = '999';
      Score.findAll.mockResolvedValue([]);

      // Act
      const result = await scoreService.getScoresByGame(gameId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getTopScores', () => {
    it('debería obtener los mejores scores exitosamente', async () => {
      // Arrange
      const limit = 5;
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 },
        { id: 2, playerId: 2, gameId: 2, points: 90, position: 1 },
        { id: 3, playerId: 3, gameId: 3, points: 80, position: 1 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getTopScores(limit);

      // Assert
      expect(Score.findAll).toHaveBeenCalledWith({
        order: [['points', 'DESC']],
        limit: limit
      });
      expect(result).toEqual(mockScores);
    });

    it('debería usar límite por defecto de 10', async () => {
      // Arrange
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getTopScores();

      // Assert
      expect(Score.findAll).toHaveBeenCalledWith({
        order: [['points', 'DESC']],
        limit: 10
      });
      expect(result).toEqual(mockScores);
    });
  });

  describe('getPlayerStats', () => {
    it('debería obtener estadísticas del jugador exitosamente', async () => {
      // Arrange
      const playerId = '1';
      const mockScores = [
        { id: 1, playerId: 1, gameId: 1, points: 100, position: 1 },
        { id: 2, playerId: 1, gameId: 2, points: 80, position: 2 },
        { id: 3, playerId: 1, gameId: 3, points: 120, position: 1 }
      ];
      Score.findAll.mockResolvedValue(mockScores);

      // Act
      const result = await scoreService.getPlayerStats(playerId);

      // Assert
      expect(Score.findAll).toHaveBeenCalledWith({ where: { playerId } });
      expect(result).toEqual({
        totalGames: 3,
        totalPoints: 300,
        averagePoints: 100,
        wins: 2,
        winRate: 66.67
      });
    });

    it('debería manejar jugador sin scores', async () => {
      // Arrange
      const playerId = '999';
      Score.findAll.mockResolvedValue([]);

      // Act
      const result = await scoreService.getPlayerStats(playerId);

      // Assert
      expect(result).toEqual({
        totalGames: 0,
        totalPoints: 0,
        averagePoints: 0,
        wins: 0,
        winRate: 0
      });
    });
  });

  describe('validateScoreData', () => {
    it('debería validar datos de score correctamente', () => {
      // Arrange
      const validScoreData = {
        playerId: 1,
        gameId: 1,
        points: 100,
        position: 1
      };

      // Act
      const result = scoreService.validateScoreData(validScoreData);

      // Assert
      expect(result).toBe(true);
    });

    it('debería retornar false para datos inválidos', () => {
      // Arrange
      const invalidScoreData = {
        playerId: 1,
        gameId: 1,
        points: -10, // Puntos negativos
        position: 1
      };

      // Act
      const result = scoreService.validateScoreData(invalidScoreData);

      // Assert
      expect(result).toBe(false);
    });
  });
});
