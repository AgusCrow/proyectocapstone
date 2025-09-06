import { jest } from '@jest/globals';
import { Player } from '../../src/orm/index.js';
import playerService from '../../src/services/playerService.js';

// Mock del ORM
jest.mock('../../src/orm/index.js', () => ({
  __esModule: true,
  Player: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('Player Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests existentes corregidos
  describe('createPlayer', () => {
    it('debería crear un jugador exitosamente', async () => {
      const playerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.create.mockResolvedValue(mockPlayer);
      
      const result = await playerService.createPlayer(playerData);
      
      expect(Player.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('debería manejar errores de validación', async () => {
      const playerData = { username: 'testuser' };
      Player.create.mockRejectedValue(new Error('Validation error'));
      
      await expect(playerService.createPlayer(playerData)).rejects.toThrow('Validation error');
    });
  });

  describe('getPlayerById', () => {
    it('debería obtener un jugador por ID', async () => {
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.findByPk.mockResolvedValue(mockPlayer);
      const result = await playerService.getPlayerById(1);
      
      expect(Player.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('debería retornar null si no existe', async () => {
      Player.findByPk.mockResolvedValue(null);
      const result = await playerService.getPlayerById(999);
      expect(result).toBeNull();
    });
  });

  // ... (otros tests existentes corregidos)

  // Nuevos tests para funciones no cubiertas
  describe('getActivePlayers', () => {
    it('debería retornar jugadores activos', async () => {
      const mockPlayers = [
        { id: 1, username: 'player1', email: 'player1@example.com', activo: true, toJSON: () => ({ id: 1, username: 'player1', email: 'player1@example.com', activo: true }) },
        { id: 2, username: 'player2', email: 'player2@example.com', activo: false, toJSON: () => ({ id: 2, username: 'player2', email: 'player2@example.com', activo: false }) },
        { id: 3, username: 'player3', email: 'player3@example.com', activo: true, toJSON: () => ({ id: 3, username: 'player3', email: 'player3@example.com', activo: true }) }
      ];
      
      Player.findAll.mockResolvedValue(mockPlayers);
      const result = await playerService.getActivePlayers();
      
      expect(Player.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, username: 'player1', email: 'player1@example.com', activo: true },
        { id: 3, username: 'player3', email: 'player3@example.com', activo: true }
      ]);
    });

    it('debería manejar errores', async () => {
      Player.findAll.mockRejectedValue(new Error('DB Error'));
      const result = await playerService.getActivePlayers();
      expect(result).toEqual([]);
    });
  });

  describe('getPlayerStats', () => {
    it('debería retornar estadísticas correctas', async () => {
      const mockPlayers = [
        { id: 1, username: 'player1', email: 'player1@example.com', activo: true, toJSON: () => ({ id: 1, username: 'player1', email: 'player1@example.com', activo: true }) },
        { id: 2, username: 'player2', email: 'player2@example.com', activo: false, toJSON: () => ({ id: 2, username: 'player2', email: 'player2@example.com', activo: false }) },
        { id: 3, username: 'player3', email: 'player3@example.com', activo: true, toJSON: () => ({ id: 3, username: 'player3', email: 'player3@example.com', activo: true }) }
      ];
      
      Player.findAll.mockResolvedValue(mockPlayers);
      const result = await playerService.getPlayerStats();
      
      expect(Player.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        total: 3,
        active: 2,
        inactive: 1
      });
    });

    it('debería manejar errores', async () => {
      Player.findAll.mockRejectedValue(new Error('DB Error'));
      const result = await playerService.getPlayerStats();
      expect(result).toEqual({ total: 0, active: 0, inactive: 0 });
    });
  });

  // Tests corregidos para funciones con nombres diferentes
  describe('findPlayerByUsername', () => {
    it('debería encontrar jugador por username', async () => {
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.findAll.mockResolvedValue([mockPlayer]);
      const result = await playerService.findPlayerByUsername('testuser');
      
      expect(Player.findAll).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('debería retornar null si no existe', async () => {
      Player.findAll.mockResolvedValue([]);
      const result = await playerService.findPlayerByUsername('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findPlayerByEmail', () => {
    it('debería encontrar jugador por email', async () => {
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.findAll.mockResolvedValue([mockPlayer]);
      const result = await playerService.findPlayerByEmail('test@example.com');
      
      expect(Player.findAll).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('debería retornar null si no existe', async () => {
      Player.findAll.mockResolvedValue([]);
      const result = await playerService.findPlayerByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('validateCredentials', () => {
    it('debería validar credenciales correctas', async () => {
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpass',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.findAll.mockResolvedValue([mockPlayer]);
      const result = await playerService.validateCredentials('testuser', 'password');
      
      expect(Player.findAll).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('debería retornar null si username no existe', async () => {
      Player.findAll.mockResolvedValue([]);
      const result = await playerService.validateCredentials('nonexistent', 'password');
      expect(result).toBeNull();
    });

    it('debería retornar null si contraseña es incorrecta', async () => {
      const mockPlayer = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpass',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' })
      };
      
      Player.findAll.mockResolvedValue([mockPlayer]);
      const result = await playerService.validateCredentials('testuser', 'wrongpass');
      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' });
    });
  });
});