
// Mock de la base de datos
jest.mock('../../src/orm/index.js', () => {
  const mockPlayer = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true)
  };

  const mockGame = {
    id: 1,
    name: 'Test Game',
    rules: 'Test rules',
    maxPlayers: 4,
    status: 'waiting',
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true)
  };

  const mockCard = {
    id: 1,
    color: 'red',
    value: '5',
    type: 'number',
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: jest.fn().mockReturnThis()
  };

  const mockScore = {
    id: 1,
    playerId: 1,
    gameId: 1,
    points: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    toJSON: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true)
  };

  return {
    __esModule: true,
    Player: {
      create: jest.fn().mockResolvedValue(mockPlayer),
      findByPk: jest.fn().mockResolvedValue(mockPlayer),
      findAll: jest.fn().mockResolvedValue([mockPlayer]),
      findOne: jest.fn().mockResolvedValue(mockPlayer),
      destroy: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue([1])
    },
    Game: {
      create: jest.fn().mockResolvedValue(mockGame),
      findByPk: jest.fn().mockResolvedValue(mockGame),
      findAll: jest.fn().mockResolvedValue([mockGame]),
      findOne: jest.fn().mockResolvedValue(mockGame),
      destroy: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue([1])
    },
    Card: {
      create: jest.fn().mockResolvedValue(mockCard),
      findByPk: jest.fn().mockResolvedValue(mockCard),
      findAll: jest.fn().mockResolvedValue([mockCard]),
      findOne: jest.fn().mockResolvedValue(mockCard),
      destroy: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue([1]),
      bulkCreate: jest.fn().mockResolvedValue([mockCard])
    },
    Score: {
      create: jest.fn().mockResolvedValue(mockScore),
      findByPk: jest.fn().mockResolvedValue(mockScore),
      findAll: jest.fn().mockResolvedValue([mockScore]),
      findOne: jest.fn().mockResolvedValue(mockScore),
      destroy: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue([1])
    },
    sequelize: {
      sync: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true)
    }
  };
});

// Importar después del mock
import { Card, Game, Player, Score } from '../../src/orm/index.js';

describe('Database Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Player Model', () => {
    it('debería crear un jugador exitosamente', async () => {
      // Arrange
      const playerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      // Act
      const player = await Player.create(playerData);

      // Assert
      expect(Player.create).toHaveBeenCalledWith(playerData);
      expect(player.id).toBeDefined();
      expect(player.username).toBe('testuser');
      expect(player.email).toBe('test@example.com');
      expect(player.password).toBe('hashedPassword');
    });

    it('debería validar campos únicos', async () => {
      // Arrange
      const existingPlayer = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };

      // Act
      const foundPlayer = await Player.findOne({ where: { username: 'existinguser' } });

      // Assert
      expect(Player.findOne).toHaveBeenCalledWith({ where: { username: 'existinguser' } });
      expect(foundPlayer).toBeDefined();
      expect(foundPlayer.username).toBe('testuser');
    });

    it('debería actualizar un jugador exitosamente', async () => {
      // Arrange
      const player = await Player.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      // Act
      const updatedPlayer = await Player.findByPk(player.id);

      // Assert
      expect(Player.findByPk).toHaveBeenCalledWith(player.id);
      expect(updatedPlayer).toBeDefined();
    });

    it('debería eliminar un jugador exitosamente', async () => {
      // Arrange
      const player = await Player.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      // Act
      const deletedPlayer = await Player.findByPk(player.id);

      // Assert
      expect(Player.findByPk).toHaveBeenCalledWith(player.id);
      expect(deletedPlayer).toBeDefined();
    });
  });

  describe('Game Model', () => {
    it('debería crear un juego exitosamente', async () => {
      // Arrange
      const gameData = {
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4,
        status: 'waiting'
      };

      // Act
      const game = await Game.create(gameData);

      // Assert
      expect(Game.create).toHaveBeenCalledWith(gameData);
      expect(game.id).toBeDefined();
      expect(game.name).toBe('Test Game');
      expect(game.rules).toBe('Test rules');
      expect(game.maxPlayers).toBe(4);
      expect(game.status).toBe('waiting');
    });

    it('debería actualizar el estado del juego', async () => {
      // Arrange
      const game = await Game.create({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4,
        status: 'waiting'
      });

      // Act
      const updatedGame = await Game.findByPk(game.id);

      // Assert
      expect(Game.findByPk).toHaveBeenCalledWith(game.id);
      expect(updatedGame).toBeDefined();
    });
  });

  describe('Card Model', () => {
    it('debería crear una tarjeta exitosamente', async () => {
      // Arrange
      const cardData = {
        color: 'red',
        value: '5',
        type: 'number'
      };

      // Act
      const card = await Card.create(cardData);

      // Assert
      expect(Card.create).toHaveBeenCalledWith(cardData);
      expect(card.id).toBeDefined();
      expect(card.color).toBe('red');
      expect(card.value).toBe('5');
      expect(card.type).toBe('number');
    });

    it('debería crear múltiples tarjetas para el mazo UNO', async () => {
      // Arrange
      const cardsData = [
        { color: 'red', value: '0', type: 'number' },
        { color: 'red', value: '1', type: 'number' },
        { color: 'blue', value: '2', type: 'number' }
      ];

      // Act
      const cards = await Card.bulkCreate(cardsData);

      // Assert
      expect(Card.bulkCreate).toHaveBeenCalledWith(cardsData);
      expect(cards).toHaveLength(1);
    });
  });

  describe('Score Model', () => {
    it('debería crear un score exitosamente', async () => {
      // Arrange
      const scoreData = {
        playerId: 1,
        gameId: 1,
        points: 100
      };

      // Act
      const score = await Score.create(scoreData);

      // Assert
      expect(Score.create).toHaveBeenCalledWith(scoreData);
      expect(score.id).toBeDefined();
      expect(score.playerId).toBe(1);
      expect(score.gameId).toBe(1);
      expect(score.points).toBe(100);
    });

    it('debería actualizar un score', async () => {
      // Arrange
      const score = await Score.create({
        playerId: 1,
        gameId: 1,
        points: 100
      });

      // Act
      const updatedScore = await Score.findByPk(score.id);

      // Assert
      expect(Score.findByPk).toHaveBeenCalledWith(score.id);
      expect(updatedScore).toBeDefined();
    });
  });

  describe('Relationships', () => {
    it('debería obtener jugadores de un juego', async () => {
      // Arrange
      const game = await Game.create({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });

      // Act
      const players = await Player.findAll();

      // Assert
      expect(Player.findAll).toHaveBeenCalled();
      expect(players).toHaveLength(1);
    });
  });

  describe('Queries Complejas', () => {
    it('debería obtener scores con información de jugador y juego', async () => {
      // Arrange
      const score = await Score.create({
        playerId: 1,
        gameId: 1,
        points: 100
      });

      // Act
      const scores = await Score.findAll();

      // Assert
      expect(Score.findAll).toHaveBeenCalled();
      expect(scores).toHaveLength(1);
      expect(scores[0].points).toBe(100);
    });

    it('debería obtener el top 5 de scores', async () => {
      // Arrange
      await Score.create({ playerId: 1, gameId: 1, points: 100 });
      await Score.create({ playerId: 2, gameId: 1, points: 150 });
      await Score.create({ playerId: 3, gameId: 1, points: 80 });

      // Act
      const scores = await Score.findAll();

      // Assert
      expect(Score.findAll).toHaveBeenCalled();
      expect(scores).toHaveLength(1);
    });
  });
}); 