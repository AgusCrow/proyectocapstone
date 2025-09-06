import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

// Mock the database layer
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

// Mock JWT for authentication
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn().mockReturnValue({ id: 1, username: 'testuser' })
}));

// Mock bcrypt for password hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Players API', () => {
    describe('POST /api/players', () => {
      it('debería crear un jugador exitosamente', async () => {
        const playerData = {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        };

        // Mock the database to return the correct player data
        const { Player } = require('../../src/orm/index.js');
        const mockPlayer = {
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: jest.fn().mockReturnThis()
        };
        Player.create.mockResolvedValueOnce(mockPlayer);
        Player.findAll.mockResolvedValueOnce([]); // No existing players

        const response = await request(app)
          .post('/api/players')
          .send(playerData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe('newuser');
        expect(response.body.email).toBe('new@example.com');
      });

      it('debería retornar error 400 cuando faltan campos obligatorios', async () => {
        const playerData = {
          username: 'testuser'
          // Falta email y password
        };

        const response = await request(app)
          .post('/api/players')
          .send(playerData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/players/:id', () => {
      it('debería obtener un jugador por ID', async () => {
        const response = await request(app)
          .get('/api/players/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe('testuser');
      });

      it('debería retornar error 404 cuando el jugador no existe', async () => {
        // Mock the database to return null for non-existent player
        const { Player } = require('../../src/orm/index.js');
        Player.findByPk.mockResolvedValueOnce(null);

        const response = await request(app)
          .get('/api/players/999')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/players/:id', () => {
      it('debería actualizar un jugador exitosamente', async () => {
        const updateData = {
          username: 'updateduser',
          email: 'updated@example.com',
          password: 'newpassword'
        };

        // Mock the database to return a valid player for update
        const { Player } = require('../../src/orm/index.js');
        const updatedPlayer = {
          id: 1,
          username: 'updateduser',
          email: 'updated@example.com',
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            username: 'updateduser',
            email: 'updated@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
          })
        };
        const mockPlayer = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
          }),
          update: jest.fn().mockResolvedValue(updatedPlayer)
        };
        Player.findByPk.mockResolvedValueOnce(mockPlayer);
        Player.findAll.mockResolvedValueOnce([]); // No conflicts with email

        const response = await request(app)
          .put('/api/players/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .send(updateData)
          .expect(200);
        expect(response.body).toHaveProperty('id');
      });
    });

    describe('DELETE /api/players/:id', () => {
      it('debería eliminar un jugador exitosamente', async () => {
        const response = await request(app)
          .delete('/api/players/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(200);

        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('Authentication API', () => {
    describe('POST /api/players/register', () => {
      it('debería registrar un usuario exitosamente', async () => {
        const userData = {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        };

        // Mock the database to return no existing user
        const { Player } = require('../../src/orm/index.js');
        Player.findOne.mockResolvedValueOnce(null);

        const response = await request(app)
          .post('/api/players/register')
          .send(userData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /api/players/login', () => {
      it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
        const userData = {
          username: 'testuser',
          password: 'password123'
        };

        // Mock the database to return a valid user
        const { Player } = require('../../src/orm/index.js');
        const mockUser = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword'
        };
        Player.findOne.mockResolvedValueOnce(mockUser);

        const response = await request(app)
          .post('/api/players/login')
          .send(userData)
          .expect(200);

        expect(response.body).toHaveProperty('access_token');
      });

      it('debería retornar error 401 con credenciales inválidas', async () => {
        const userData = {
          username: 'wronguser',
          password: 'wrongpassword'
        };

        // Mock the database to return no user
        const { Player } = require('../../src/orm/index.js');
        Player.findOne.mockResolvedValueOnce(null);

        const response = await request(app)
          .post('/api/players/login')
          .send(userData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Games API', () => {
    describe('POST /api/games', () => {
      it('debería crear un juego exitosamente', async () => {
        const gameData = {
          name: 'Test Game',
          rules: 'Test rules',
          maxPlayers: 4
        };

        const response = await request(app)
          .post('/api/games')
          .set('Authorization', 'Bearer mock.jwt.token')
          .send(gameData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Game');
      });
    });

    describe('GET /api/games/:id', () => {
      it('debería obtener un juego por ID', async () => {
        const response = await request(app)
          .get('/api/games/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Game');
      });
    });
  });

  describe('Cards API', () => {
    describe('POST /api/cards', () => {
      it('debería crear una tarjeta exitosamente', async () => {
        const cardData = {
          color: 'red',
          value: '5',
          type: 'normal'
        };

        // Mock the database to return a valid card
        const { Card } = require('../../src/orm/index.js');
        const mockCard = {
          id: 1,
          color: 'red',
          value: '5',
          type: 'normal',
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: jest.fn().mockReturnThis()
        };
        Card.create.mockResolvedValueOnce(mockCard);

        const response = await request(app)
          .post('/api/cards')
          .set('Authorization', 'Bearer mock.jwt.token')
          .send(cardData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.color).toBe('red');
      });
    });

    describe('GET /api/cards/:id', () => {
      it('debería obtener una tarjeta por ID', async () => {
        const response = await request(app)
          .get('/api/cards/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.color).toBe('red');
      });
    });
  });

  describe('Scores API', () => {
    describe('POST /api/scores', () => {
      it('debería crear un score exitosamente', async () => {
        const scoreData = {
          playerId: 1,
          gameId: 1,
          points: 100
        };

        const response = await request(app)
          .post('/api/scores')
          .set('Authorization', 'Bearer mock.jwt.token')
          .send(scoreData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.points).toBe(100);
      });
    });

    describe('GET /api/scores/:id', () => {
      it('debería obtener un score por ID', async () => {
        const response = await request(app)
          .get('/api/scores/1')
          .set('Authorization', 'Bearer mock.jwt.token')
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.points).toBe(100);
      });
    });
  });

  describe('Error Handling', () => {
    it('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 