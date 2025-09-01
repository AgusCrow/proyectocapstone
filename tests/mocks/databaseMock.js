// Mock de base de datos para tests
export const mockSequelize = {
  sync: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true)
};

export const mockPlayer = {
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

export const mockGame = {
  id: 1,
  name: 'Test Game',
  rules: 'Test rules',
  maxPlayers: 4,
  status: 'waiting',
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
  addPlayer: jest.fn().mockResolvedValue(true),
  getPlayers: jest.fn().mockResolvedValue([])
};

export const mockCard = {
  id: 1,
  color: 'red',
  value: '5',
  type: 'number',
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true)
};

export const mockScore = {
  id: 1,
  playerId: 1,
  gameId: 1,
  score: 100,
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true)
};

// Mock de modelos
export const Player = {
  create: jest.fn().mockResolvedValue(mockPlayer),
  findByPk: jest.fn().mockResolvedValue(mockPlayer),
  findAll: jest.fn().mockResolvedValue([mockPlayer]),
  findOne: jest.fn().mockResolvedValue(mockPlayer),
  destroy: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue([1])
};

export const Game = {
  create: jest.fn().mockResolvedValue(mockGame),
  findByPk: jest.fn().mockResolvedValue(mockGame),
  findAll: jest.fn().mockResolvedValue([mockGame]),
  findOne: jest.fn().mockResolvedValue(mockGame),
  destroy: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue([1])
};

export const Card = {
  create: jest.fn().mockResolvedValue(mockCard),
  findByPk: jest.fn().mockResolvedValue(mockCard),
  findAll: jest.fn().mockResolvedValue([mockCard]),
  findOne: jest.fn().mockResolvedValue(mockCard),
  destroy: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue([1]),
  bulkCreate: jest.fn().mockResolvedValue([mockCard])
};

export const Score = {
  create: jest.fn().mockResolvedValue(mockScore),
  findByPk: jest.fn().mockResolvedValue(mockScore),
  findAll: jest.fn().mockResolvedValue([mockScore]),
  findOne: jest.fn().mockResolvedValue(mockScore),
  destroy: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue([1]),
  bulkCreate: jest.fn().mockResolvedValue([mockScore])
}; 