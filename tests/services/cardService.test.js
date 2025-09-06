// cardService.test.js
import { Card } from '../../src/orm/index.js';
import cardService from '../../src/services/cardService.js';

// Mock de las dependencias
jest.mock('../../src/orm/index.js', () => ({
  Card: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

// Importamos el módulo mockeado para poder acceder a las funciones mock
const functional = require('../../src/utils/functional.js');
jest.mock('../../src/utils/functional.js', () => ({
  map: jest.fn((fn) => (arr) => arr.map(fn)),
  identity: jest.fn((x) => x)
}));

describe('Card Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('initDeck', () => {
    it('should initialize the deck with standard UNO cards', async () => {
      // Mock de Card.destroy y Card.bulkCreate
      Card.destroy.mockResolvedValue();
      Card.bulkCreate.mockResolvedValue();
      const result = await cardService.initDeck();
      
      // Verificar que se limpió el mazo anterior
      expect(Card.destroy).toHaveBeenCalledWith({ where: {} });
      
      // Verificar que se crearon las cartas
      expect(Card.bulkCreate).toHaveBeenCalled();
      
      // Verificar el resultado
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Verificar que hay 108 cartas (estándar de UNO)
      expect(result.length).toBe(108);
      
      // Verificar que hay cartas de cada color
      const colors = ['red', 'yellow', 'green', 'blue'];
      colors.forEach(color => {
        const colorCards = result.filter(card => card.color === color);
        expect(colorCards.length).toBe(25); // 25 cartas por color
      });
      
      // Verificar cartas numéricas por color
      colors.forEach(color => {
        const colorCards = result.filter(card => card.color === color && card.type === 'normal');
        expect(colorCards.filter(c => c.value === '0').length).toBe(1); // Un solo 0
        ['1','2','3','4','5','6','7','8','9','skip','reverse','draw2'].forEach(value => {
          expect(colorCards.filter(c => c.value === value).length).toBe(2); // Dos de cada valor
        });
      });
      
      // Verificar que hay cartas especiales
      const specialCards = result.filter(card => card.type === 'special');
      expect(specialCards.length).toBe(8); // 4 wild + 4 wild_draw4
      expect(specialCards.filter(c => c.value === 'wild').length).toBe(4);
      expect(specialCards.filter(c => c.value === 'wild_draw4').length).toBe(4);
    });
    it('should handle errors when initializing deck - destroy fails', async () => {
      Card.destroy.mockRejectedValue(new Error('Database error'));
      await expect(cardService.initDeck()).rejects.toThrow('Database error');
    });
    it('should handle errors when initializing deck - bulkCreate fails', async () => {
      Card.destroy.mockResolvedValue();
      Card.bulkCreate.mockRejectedValue(new Error('Bulk create error'));
      await expect(cardService.initDeck()).rejects.toThrow('Bulk create error');
    });
  });
  
  describe('createCard', () => {
    it('should create a new card', async () => {
      const cardData = { color: 'red', value: '5', type: 'normal' };
      const createdCard = { id: 1, ...cardData };
      
      Card.create.mockResolvedValue(createdCard);
      const result = await cardService.createCard(cardData);
      expect(Card.create).toHaveBeenCalledWith(cardData);
      expect(result).toEqual(createdCard);
    });
    it('should handle errors when creating card', async () => {
      const cardData = { color: 'red', value: '5', type: 'normal' };
      Card.create.mockRejectedValue(new Error('Database error'));
      await expect(cardService.createCard(cardData)).rejects.toThrow('Database error');
    });
  });
  
  describe('getCardById', () => {
    it('should return a card by id', async () => {
      const cardId = 1;
      const card = { id: cardId, color: 'red', value: '5', type: 'normal' };
      
      Card.findByPk.mockResolvedValue(card);
      const result = await cardService.getCardById(cardId);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(result).toEqual(card);
    });
    it('should return null if card not found', async () => {
      const cardId = 999;
      Card.findByPk.mockResolvedValue(null);
      const result = await cardService.getCardById(cardId);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(result).toBeNull();
    });
    it('should handle errors when getting card by id', async () => {
      const cardId = 1;
      Card.findByPk.mockRejectedValue(new Error('Database error'));
      await expect(cardService.getCardById(cardId)).rejects.toThrow('Database error');
    });
  });
  
  describe('updateCard', () => {
    it('should update a card', async () => {
      const cardId = 1;
      const cardData = { color: 'blue', value: '7' };
      const existingCard = { id: cardId, color: 'red', value: '5', type: 'normal', update: jest.fn() };
      const updatedCard = { ...existingCard, ...cardData };
      
      Card.findByPk.mockResolvedValue(existingCard);
      existingCard.update.mockResolvedValue(updatedCard);
      const result = await cardService.updateCard(cardId, cardData);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(existingCard.update).toHaveBeenCalledWith(cardData);
      expect(result).toEqual(updatedCard);
    });
    it('should return null if card not found', async () => {
      const cardId = 999;
      const cardData = { color: 'blue', value: '7' };
      
      Card.findByPk.mockResolvedValue(null);
      const result = await cardService.updateCard(cardId, cardData);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(result).toBeNull();
    });
    it('should handle errors when updating card', async () => {
      const cardId = 1;
      const cardData = { color: 'blue', value: '7' };
      const existingCard = { id: cardId, color: 'red', value: '5', type: 'normal', update: jest.fn() };
      
      Card.findByPk.mockResolvedValue(existingCard);
      existingCard.update.mockRejectedValue(new Error('Database error'));
      await expect(cardService.updateCard(cardId, cardData)).rejects.toThrow('Database error');
    });
  });
  
  describe('deleteCard', () => {
    it('should delete a card', async () => {
      const cardId = 1;
      const card = { id: cardId, color: 'red', value: '5', type: 'normal', destroy: jest.fn() };
      
      Card.findByPk.mockResolvedValue(card);
      card.destroy.mockResolvedValue();
      const result = await cardService.deleteCard(cardId);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(card.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    it('should return null if card not found', async () => {
      const cardId = 999;
      Card.findByPk.mockResolvedValue(null);
      const result = await cardService.deleteCard(cardId);
      expect(Card.findByPk).toHaveBeenCalledWith(cardId);
      expect(result).toBeNull();
    });
    it('should handle errors when deleting card', async () => {
      const cardId = 1;
      const card = { id: cardId, color: 'red', value: '5', type: 'normal', destroy: jest.fn() };
      
      Card.findByPk.mockResolvedValue(card);
      card.destroy.mockRejectedValue(new Error('Database error'));
      await expect(cardService.deleteCard(cardId)).rejects.toThrow('Database error');
    });
  });
  
  describe('listCards', () => {
    it('should list all cards', async () => {
      const cards = [
        { id: 1, color: 'red', value: '5', type: 'normal' },
        { id: 2, color: 'blue', value: '7', type: 'normal' }
      ];
      
      Card.findAll.mockResolvedValue(cards);
      const result = await cardService.listCards();
      expect(Card.findAll).toHaveBeenCalled();
      expect(result).toEqual(cards);
      // Verificar que se llamó a map sin verificar con qué parámetro
      expect(functional.map).toHaveBeenCalled();
    });
    it('should handle errors when listing cards', async () => {
      Card.findAll.mockRejectedValue(new Error('Database error'));
      await expect(cardService.listCards()).rejects.toThrow('Database error');
    });
  });
  
  describe('getCardsByColor', () => {
    it('should get cards by color', async () => {
      const color = 'red';
      const cards = [
        { id: 1, color: 'red', value: '5', type: 'normal' },
        { id: 2, color: 'red', value: '7', type: 'normal' }
      ];
      
      Card.findAll.mockResolvedValue(cards);
      const result = await cardService.getCardsByColor(color);
      expect(Card.findAll).toHaveBeenCalledWith({ where: { color } });
      expect(result).toEqual(cards);
      // Verificar que se llamó a map sin verificar con qué parámetro
      expect(functional.map).toHaveBeenCalled();
    });
    it('should handle errors when getting cards by color', async () => {
      const color = 'red';
      Card.findAll.mockRejectedValue(new Error('Database error'));
      await expect(cardService.getCardsByColor(color)).rejects.toThrow('Database error');
    });
  });
  
  describe('getCardsByType', () => {
    it('should get cards by type', async () => {
      const type = 'special';
      const cards = [
        { id: 1, color: 'black', value: 'wild', type: 'special' },
        { id: 2, color: 'black', value: 'wild_draw4', type: 'special' }
      ];
      
      Card.findAll.mockResolvedValue(cards);
      const result = await cardService.getCardsByType(type);
      expect(Card.findAll).toHaveBeenCalledWith({ where: { type } });
      expect(result).toEqual(cards);
      // Verificar que se llamó a map sin verificar con qué parámetro
      expect(functional.map).toHaveBeenCalled();
    });
    it('should handle errors when getting cards by type', async () => {
      const type = 'special';
      Card.findAll.mockRejectedValue(new Error('Database error'));
      await expect(cardService.getCardsByType(type)).rejects.toThrow('Database error');
    });
  });
  
  describe('getTopCard', () => {
    it('should get the top card for a game', async () => {
      const gameId = 1;
      const topCard = { id: 1, color: 'red', value: '5', type: 'normal' };
      
      Card.findOne.mockResolvedValue(topCard);
      const result = await cardService.getTopCard(gameId);
      expect(Card.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'ASC']] });
      expect(result).toBe('red_5');
    });
    it('should return null if no card found', async () => {
      const gameId = 1;
      Card.findOne.mockResolvedValue(null);
      const result = await cardService.getTopCard(gameId);
      expect(Card.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'ASC']] });
      expect(result).toBeNull();
    });
    it('should handle card with null color', async () => {
      const gameId = 1;
      const topCard = { id: 1, color: null, value: '5', type: 'normal' };
      
      Card.findOne.mockResolvedValue(topCard);
      const result = await cardService.getTopCard(gameId);
      expect(Card.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'ASC']] });
      expect(result).toBe('red_5'); // Color por defecto 'red'
    });
    it('should handle card with null value', async () => {
      const gameId = 1;
      const topCard = { id: 1, color: 'red', value: null, type: 'normal' };
      
      Card.findOne.mockResolvedValue(topCard);
      const result = await cardService.getTopCard(gameId);
      expect(Card.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'ASC']] });
      expect(result).toBe('red_0'); // Valor por defecto '0'
    });
    it('should handle card with both null color and value', async () => {
      const gameId = 1;
      const topCard = { id: 1, color: null, value: null, type: 'normal' };
      
      Card.findOne.mockResolvedValue(topCard);
      const result = await cardService.getTopCard(gameId);
      expect(Card.findOne).toHaveBeenCalledWith({ order: [['createdAt', 'ASC']] });
      expect(result).toBe('red_0'); // Valores por defecto
    });
    it('should handle errors when getting top card', async () => {
      const gameId = 1;
      Card.findOne.mockRejectedValue(new Error('Database error'));
      await expect(cardService.getTopCard(gameId)).rejects.toThrow('Database error');
    });
  });
});