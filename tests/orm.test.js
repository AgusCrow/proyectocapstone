import { Sequelize } from 'sequelize';
import { jest } from '@jest/globals';
import { Player, Card, Game, PlayerCard, Score, ApiStat, sequelize } from '../src/orm/index.js';

// Mock environment variables
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock Sequelize
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockImplementation((modelName, attributes, options) => ({
      modelName,
      attributes,
      options,
      belongsTo: jest.fn(),
      belongsToMany: jest.fn(),
      hasMany: jest.fn(),
      hasOne: jest.fn(),
      sync: jest.fn().mockResolvedValue(true),
      findOne: jest.fn(),
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
jest.mock('../src/models/player.js', () => jest.fn().mockReturnValue({ modelName: 'Player' }));
jest.mock('../src/models/card.js', () => jest.fn().mockReturnValue({ modelName: 'Card' }));
jest.mock('../src/models/game.js', () => jest.fn().mockReturnValue({ modelName: 'Game' }));
jest.mock('../src/models/playerCard.js', () => jest.fn().mockReturnValue({ modelName: 'PlayerCard' }));
jest.mock('../src/models/score.js', () => jest.fn().mockReturnValue({ modelName: 'Score' }));
jest.mock('../src/models/apiStat.js', () => jest.fn().mockReturnValue({ modelName: 'ApiStat' }));

describe('ORM Tests', () => {
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

  describe('Sequelize Instance', () => {
    it('should initialize Sequelize with correct configuration', () => {
      // Re-import to test with environment variables
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
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

    it('should authenticate database connection', async () => {
      // Re-import to test authentication
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
      await expect(sequelize.authenticate()).resolves.toBe(true);
      expect(mockSequelizeInstance.authenticate).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockSequelizeInstance.authenticate.mockRejectedValue(new Error('Connection failed'));
      
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
      await expect(sequelize.authenticate()).rejects.toThrow('Connection failed');
    });
  });

  describe('Model Initialization', () => {
    it('should initialize all models with Sequelize instance', () => {
      // Re-import to test model initialization
      jest.resetModules();
      const { Player, Card, Game, PlayerCard, Score, ApiStat } = require('../src/orm/index.js');
      
      expect(Player).toBeDefined();
      expect(Card).toBeDefined();
      expect(Game).toBeDefined();
      expect(PlayerCard).toBeDefined();
      expect(Score).toBeDefined();
      expect(ApiStat).toBeDefined();
    });

    it('should export all model instances', () => {
      const models = { Player, Card, Game, PlayerCard, Score, ApiStat, sequelize };
      
      Object.entries(models).forEach(([name, model]) => {
        expect(model).toBeDefined();
        expect(typeof model).toBe('object');
      });
    });

    it('should export sequelize instance', () => {
      expect(sequelize).toBeDefined();
      expect(sequelize).toBe(mockSequelizeInstance);
    });
  });

  describe('Model Associations', () => {
    it('should define Player-Game many-to-many relationship', () => {
      // Re-import to test associations
      jest.resetModules();
      const { Player, Game } = require('../src/orm/index.js');
      
      expect(Player.belongsToMany).toHaveBeenCalledWith(Game, { through: 'GamePlayers' });
      expect(Game.belongsToMany).toHaveBeenCalledWith(Player, { through: 'GamePlayers' });
    });

    it('should define Player-PlayerCard one-to-many relationship', () => {
      jest.resetModules();
      const { Player, PlayerCard } = require('../src/orm/index.js');
      
      expect(Player.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'playerId' });
    });

    it('should define Game-PlayerCard one-to-many relationship', () => {
      jest.resetModules();
      const { Game, PlayerCard } = require('../src/orm/index.js');
      
      expect(Game.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'gameId' });
    });

    it('should define Card-PlayerCard one-to-many relationship', () => {
      jest.resetModules();
      const { Card, PlayerCard } = require('../src/orm/index.js');
      
      expect(Card.hasMany).toHaveBeenCalledWith(PlayerCard, { foreignKey: 'cardId' });
    });

    it('should define PlayerCard-Player many-to-one relationship', () => {
      jest.resetModules();
      const { PlayerCard, Player } = require('../src/orm/index.js');
      
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Player, { foreignKey: 'playerId' });
    });

    it('should define PlayerCard-Game many-to-one relationship', () => {
      jest.resetModules();
      const { PlayerCard, Game } = require('../src/orm/index.js');
      
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Game, { foreignKey: 'gameId' });
    });

    it('should define PlayerCard-Card many-to-one relationship', () => {
      jest.resetModules();
      const { PlayerCard, Card } = require('../src/orm/index.js');
      
      expect(PlayerCard.belongsTo).toHaveBeenCalledWith(Card, { foreignKey: 'cardId' });
    });
  });

  describe('Model Synchronization', () => {
    it('should sync all models with database', async () => {
      // Re-import to test sync
      jest.resetModules();
      const { Player, Card, Game, PlayerCard, Score, ApiStat } = require('../src/orm/index.js');
      
      await Player.sync();
      await Card.sync();
      await Game.sync();
      await PlayerCard.sync();
      await Score.sync();
      await ApiStat.sync();
      
      expect(Player.sync).toHaveBeenCalled();
      expect(Card.sync).toHaveBeenCalled();
      expect(Game.sync).toHaveBeenCalled();
      expect(PlayerCard.sync).toHaveBeenCalled();
      expect(Score.sync).toHaveBeenCalled();
      expect(ApiStat.sync).toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      const syncError = new Error('Sync failed');
      mockSequelizeInstance.define.mockImplementation((modelName, attributes, options) => ({
        modelName,
        attributes,
        options,
        sync: jest.fn().mockRejectedValue(syncError)
      }));
      
      jest.resetModules();
      const { Player } = require('../src/orm/index.js');
      
      await expect(Player.sync()).rejects.toThrow('Sync failed');
    });
  });

  describe('Model Operations', () => {
    it('should support basic CRUD operations', () => {
      // Re-import to test model operations
      jest.resetModules();
      const { Player } = require('../src/orm/index.js');
      
      expect(typeof Player.findOne).toBe('function');
      expect(typeof Player.belongsTo).toBe('function');
      expect(typeof Player.hasMany).toBe('function');
    });

    it('should have correct model structure', () => {
      // Re-import to test model structure
      jest.resetModules();
      const { Player, Card, Game, PlayerCard, Score, ApiStat } = require('../src/orm/index.js');
      
      const models = [Player, Card, Game, PlayerCard, Score, ApiStat];
      
      models.forEach(model => {
        expect(model).toHaveProperty('modelName');
        expect(model).toHaveProperty('attributes');
        expect(model).toHaveProperty('options');
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASS;
      delete process.env.DB_HOST;
      
      jest.resetModules();
      
      expect(() => {
        require('../src/orm/index.js');
      }).not.toThrow();
    });

    it('should use default values when environment variables are missing', () => {
      delete process.env.DB_DIALECT;
      
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
      const config = Sequelize.mock.calls[0][3];
      expect(config.dialect).toBe('mysql');
    });
  });

  describe('Export Structure', () => {
    it('should export all required models and sequelize instance', () => {
      const exported = require('../src/orm/index.js');
      
      expect(exported).toHaveProperty('Player');
      expect(exported).toHaveProperty('Card');
      expect(exported).toHaveProperty('Game');
      expect(exported).toHaveProperty('PlayerCard');
      expect(exported).toHaveProperty('Score');
      expect(exported).toHaveProperty('ApiStat');
      expect(exported).toHaveProperty('sequelize');
    });

    it('should export the correct model instances', () => {
      const models = ['Player', 'Card', 'Game', 'PlayerCard', 'Score', 'ApiStat'];
      
      models.forEach(modelName => {
        const model = require('../src/orm/index.js')[modelName];
        expect(model).toBeDefined();
        expect(model.modelName).toBe(modelName);
      });
    });
  });

  describe('Database Connection', () => {
    it('should configure database connection with correct options', () => {
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
      const config = Sequelize.mock.calls[0][3];
      
      expect(config.host).toBe('localhost');
      expect(config.dialect).toBe('mysql');
      expect(config.logging).toBe(false);
    });

    it('should support different database dialects', () => {
      process.env.DB_DIALECT = 'postgres';
      
      jest.resetModules();
      const { sequelize } = require('../src/orm/index.js');
      
      const config = Sequelize.mock.calls[0][3];
      expect(config.dialect).toBe('postgres');
      
      delete process.env.DB_DIALECT;
    });
  });

  describe('Error Handling', () => {
    it('should handle model initialization errors', () => {
      const modelError = new Error('Model initialization failed');
      
      jest.doMock('../src/models/player.js', () => {
        throw modelError;
      });
      
      expect(() => {
        jest.resetModules();
        require('../src/orm/index.js');
      }).toThrow(modelError);
    });

    it('should handle association definition errors', () => {
      const associationError = new Error('Association definition failed');
      
      // Mock a model to throw error during association
      jest.doMock('../src/models/player.js', () => 
        jest.fn().mockImplementation(() => {
          throw associationError;
        })
      );
      
      expect(() => {
        jest.resetModules();
        require('../src/orm/index.js');
      }).toThrow(associationError);
    });
  });
});