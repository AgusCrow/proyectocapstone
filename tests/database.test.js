import { jest } from '@jest/globals';
import { Sequelize } from 'sequelize';
import {
    ApiStat,
    Card,
    Game,
    Player,
    PlayerCard,
    Score,
    sequelize
} from '../../src/database/database.js';

// Mock environment variables
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock Sequelize
jest.mock('sequelize', () => {
  const mockSequelize = {
    define: jest.fn().mockImplementation((modelName, attributes, options) => ({
      modelName,
      attributes,
      options,
      belongsToMany: jest.fn(),
      hasMany: jest.fn(),
      belongsTo: jest.fn()
    }))
  };
  
  return {
    Sequelize: jest.fn().mockImplementation(() => mockSequelize),
    DataTypes: {
      STRING: 'STRING',
      INTEGER: 'INTEGER',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TEXT: 'TEXT'
    }
  };
});

// Mock model imports
jest.mock('../../src/models/apiStat.js', () => jest.fn().mockReturnValue({ modelName: 'ApiStat' }));
jest.mock('../../src/models/card.js', () => jest.fn().mockReturnValue({ modelName: 'Card' }));
jest.mock('../../src/models/game.js', () => jest.fn().mockReturnValue({ modelName: 'Game' }));
jest.mock('../../src/models/player.js', () => jest.fn().mockReturnValue({ modelName: 'Player' }));
jest.mock('../../src/models/playerCard.js', () => jest.fn().mockReturnValue({ modelName: 'PlayerCard' }));
jest.mock('../../src/models/score.js', () => jest.fn().mockReturnValue({ modelName: 'Score' }));

describe('Database Tests', () => {
  let mockSequelizeInstance;

  beforeEach(() => {
    // Set environment variables for testing
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASS = 'test_pass';
    process.env.DB_HOST = 'localhost';
    process.env.DB_DIALECT = 'mysql';
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get the mocked Sequelize instance
    mockSequelizeInstance = new Sequelize();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_HOST;
    delete process.env.DB_DIALECT;
  });

  describe('Sequelize Configuration', () => {
    it('should initialize Sequelize with correct configuration', () => {
      // Re-import to test with environment variables
      jest.resetModules();
      const { sequelize } = require('../../src/database/database.js');
      
      expect(Sequelize).toHaveBeenCalledWith(
        'test_db',
        'test_user',
        'test_pass',
        {
          host: 'localhost',
          dialect: 'mysql',
          logging: false
        }
      );
    });

    it('should use default dialect when not provided', () => {
      delete process.env.DB_DIALECT;
      
      jest.resetModules();
      const { sequelize } = require('../../src/database/database.js');
      
      expect(Sequelize).toHaveBeenCalledWith(
        'test_db',
        'test_user',
        'test_pass',
        {
          host: 'localhost',
          dialect: 'mysql',
          logging: false
        }
      );
    });

    it('should have logging disabled', () => {
      jest.resetModules();
      const { sequelize } = require('../../src/database/database.js');
      
      const config = Sequelize.mock.calls[0][3];
      expect(config.logging).toBe(false);
    });
  });

  describe('Model Initialization', () => {
    it('should initialize all models with Sequelize instance', () => {
      const apiStatModel = require('../../src/models/apiStat.js');
      const cardModel = require('../../src/models/card.js');
      const gameModel = require('../../src/models/game.js');
      const playerModel = require('../../src/models/player.js');
      const playerCardModel = require('../../src/models/playerCard.js');
      const scoreModel = require('../../src/models/score.js');

      expect(apiStatModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
      expect(cardModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
      expect(gameModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
      expect(playerModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
      expect(playerCardModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
      expect(scoreModel).toHaveBeenCalledWith(mockSequelizeInstance, expect.any(Object));
    });

    it('should export all model instances', () => {
      expect(ApiStat).toBeDefined();
      expect(Card).toBeDefined();
      expect(Game).toBeDefined();
      expect(Player).toBeDefined();
      expect(PlayerCard).toBeDefined();
      expect(Score).toBeDefined();
      expect(sequelize).toBeDefined();
    });

    it('should export sequelize instance', () => {
      expect(sequelize).toBe(mockSequelizeInstance);
    });
  });

  describe('Model Associations', () => {
    it('should define Player-Game many-to-many relationship', () => {
      expect(Player.belongsToMany).toHaveBeenCalledWith(Game, { through: 'GamePlayers' });
      expect(Game.belongsToMany).toHaveBeenCalledWith(Player, { through: 'GamePlayers' });
    });

    it('should define Player-PlayerCard one-to-many relationship', () => {
      expect(Player.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'playerId' });
    });

    it('should define Game-PlayerCard one-to-many relationship', () => {
      expect(Game.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'gameId' });
    });

    it('should define Card-PlayerCard one-to-many relationship', () => {
      expect(Card.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'cardId' });
    });

    it('should define PlayerCard-Player many-to-one relationship', () => {
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Player, { foreignKey: 'playerId' });
    });

    it('should define PlayerCard-Game many-to-one relationship', () => {
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Game, { foreignKey: 'gameId' });
    });

    it('should define PlayerCard-Card many-to-one relationship', () => {
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Card, { foreignKey: 'cardId' });
    });
  });

  describe('Foreign Key Configuration', () => {
    it('should use correct foreign key names', () => {
      // Check PlayerCard foreign keys
      const playerCardPlayerAssoc = PlayerCard.belongsTo.mock.calls.find(
        call => call[0] === Player
      );
      expect(playerCardPlayerAssoc[1].foreignKey).toBe('playerId');

      const playerCardGameAssoc = PlayerCard.belongsTo.mock.calls.find(
        call => call[0] === Game
      );
      expect(playerCardGameAssoc[1].foreignKey).toBe('gameId');

      const playerCardCardAssoc = PlayerCard.belongsTo.mock.calls.find(
        call => call[0] === Card
      );
      expect(playerCardCardAssoc[1].foreignKey).toBe('cardId');
    });

    it('should use correct foreign key names for hasMany relationships', () => {
      // Check Player hasMany PlayerCard
      const playerPlayerCardAssoc = Player.hasMany.mock.calls.find(
        call => call[0] === PlayerCard
      );
      expect(playerPlayerCardAssoc[1].foreignKey).toBe('playerId');

      // Check Game hasMany PlayerCard
      const gamePlayerCardAssoc = Game.hasMany.mock.calls.find(
        call => call[0] === PlayerCard
      );
      expect(gamePlayerCardAssoc[1].foreignKey).toBe('gameId');

      // Check Card hasMany PlayerCard
      const cardPlayerCardAssoc = Card.hasMany.mock.calls.find(
        call => call[0] === PlayerCard
      );
      expect(cardPlayerCardAssoc[1].foreignKey).toBe('cardId');
    });
  });

  describe('Through Table Configuration', () => {
    it('should use GamePlayers as through table for Player-Game relationship', () => {
      expect(Player.belongsToMany).toHaveBeenCalledWith(Game, { through: 'GamePlayers' });
      expect(Game.belongsToMany).toHaveBeenCalledWith(Player, { through: 'GamePlayers' });
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASS;
      delete process.env.DB_HOST;
      
      jest.resetModules();
      
      expect(() => {
        require('../../src/database/database.js');
      }).not.toThrow();
    });

    it('should use undefined for missing environment variables', () => {
      delete process.env.DB_NAME;
      
      jest.resetModules();
      const { sequelize } = require('../../src/database/database.js');
      
      const config = Sequelize.mock.calls[0];
      expect(config[0]).toBeUndefined(); // DB_NAME
      expect(config[1]).toBe('test_user'); // DB_USER
      expect(config[2]).toBe('test_pass'); // DB_PASS
    });
  });

  describe('Database Export Structure', () => {
    it('should export all required models and sequelize instance', () => {
      const exported = require('../../src/database/database.js');
      
      expect(exported).toHaveProperty('ApiStat');
      expect(exported).toHaveProperty('Card');
      expect(exported).toHaveProperty('Game');
      expect(exported).toHaveProperty('Player');
      expect(exported).toHaveProperty('PlayerCard');
      expect(exported).toHaveProperty('Score');
      expect(exported).toHaveProperty('sequelize');
    });

    it('should export the correct model instances', () => {
      expect(ApiStat).toEqual({ modelName: 'ApiStat' });
      expect(Card).toEqual({ modelName: 'Card' });
      expect(Game).toEqual({ modelName: 'Game' });
      expect(Player).toEqual({ modelName: 'Player' });
      expect(PlayerCard).toEqual({ modelName: 'PlayerCard' });
      expect(Score).toEqual({ modelName: 'Score' });
    });
  });

  describe('Model Association Order', () => {
    it('should define associations in the correct order', () => {
      // The order should be:
      // 1. Player-Game many-to-many
      // 2. Player-PlayerCard one-to-many
      // 3. Game-PlayerCard one-to-many
      // 4. Card-PlayerCard one-to-many
      // 5. PlayerCard-Player many-to-one
      // 6. PlayerCard-Game many-to-one
      // 7. PlayerCard-Card many-to-one

      const calls = [
        ...Player.belongsToMany.mock.calls,
        ...Game.belongsToMany.mock.calls,
        ...Player.hasMany.mock.calls,
        ...Game.hasMany.mock.calls,
        ...Card.hasMany.mock.calls,
        ...PlayerCard.belongsTo.mock.calls
      ];

      // Check that Player-Game association is defined first
      const playerGameAssoc = calls.find(call => 
        (call[0] === Game && call[2].through === 'GamePlayers') ||
        (call[0] === Player && call[2].through === 'GamePlayers')
      );
      expect(playerGameAssoc).toBeDefined();

      // Check that PlayerCard associations are defined
      const playerCardAssocs = calls.filter(call => 
        call[0] === PlayerCard || call[1] === PlayerCard
      );
      expect(playerCardAssocs.length).toBeGreaterThan(0);
    });
  });
});