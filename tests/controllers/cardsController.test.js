import { compose, prop, path, identity } from 'ramda';

jest.mock('../../src/services/cardService.js', () => ({
  __esModule: true,
  default: {
    createCard: jest.fn(),
    getCardById: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    listCards: jest.fn()
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
import cardService from '../../src/services/cardService.js';
import { createCard, getCard, updateCard, deleteCard, listCards } from '../../src/controllers/cardsController.js';

describe('Cards Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCard', () => {
    it('debería crear una tarjeta exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'red',
        value: '5',
        type: 'normal'
      });
      const res = createMockResponse();
      const mockCard = { id: 1, color: 'red', value: '5', type: 'normal' };
      cardService.createCard.mockResolvedValue(mockCard);

      // Act
      await createCard(req, res);

      // Assert
      expect(cardService.createCard).toHaveBeenCalledWith({
        color: 'red',
        value: '5',
        type: 'normal'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCard);
    });

    it('debería retornar error 400 cuando faltan campos requeridos', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'red',
        value: '5'
        // Falta type
      });
      const res = createMockResponse();

      // Act
      await createCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'color, value y type son campos requeridos'
      });
    });

    it('debería retornar error 400 cuando el color no es válido', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'purple', // Color inválido
        value: '5',
        type: 'normal'
      });
      const res = createMockResponse();

      // Act
      await createCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Color no válido'
      });
    });

    it('debería retornar error 400 cuando el tipo no es válido', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'red',
        value: '5',
        type: 'invalid' // Tipo inválido
      });
      const res = createMockResponse();

      // Act
      await createCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tipo no válido'
      });
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'red',
        value: '5',
        type: 'normal'
      });
      const res = createMockResponse();
      cardService.createCard.mockRejectedValue(new Error('Database error'));

      // Act
      await createCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear tarjeta'
      });
    });
  });

  describe('getCard', () => {
    it('debería obtener una tarjeta exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockCard = { id: 1, color: 'red', value: '5', type: 'normal' };
      cardService.getCardById.mockResolvedValue(mockCard);

      // Act
      await getCard(req, res);

      // Assert
      expect(cardService.getCardById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockCard);
    });

    it('debería retornar error 404 cuando la tarjeta no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      cardService.getCardById.mockResolvedValue(null);

      // Act
      await getCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tarjeta no encontrada'
      });
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      cardService.getCardById.mockRejectedValue(new Error('Database error'));

      // Act
      await getCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al obtener tarjeta'
      });
    });
  });

  describe('updateCard', () => {
    it('debería actualizar una tarjeta exitosamente', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'blue',
        value: '7',
        type: 'normal'
      }, { id: '1' });
      const res = createMockResponse();
      const mockCard = { id: 1, color: 'blue', value: '7', type: 'normal' };
      cardService.updateCard.mockResolvedValue(mockCard);

      // Act
      await updateCard(req, res);

      // Assert
      expect(cardService.updateCard).toHaveBeenCalledWith('1', {
        color: 'blue',
        value: '7',
        type: 'normal'
      });
      expect(res.json).toHaveBeenCalledWith(mockCard);
    });

    it('debería retornar error 400 cuando el color no es válido', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'purple', // Color inválido
        value: '5',
        type: 'normal'
      }, { id: '1' });
      const res = createMockResponse();

      // Act
      await updateCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Color no válido'
      });
    });

    it('debería retornar error 404 cuando la tarjeta no existe', async () => {
      // Arrange
      const req = createMockRequest({
        color: 'blue',
        value: '7',
        type: 'normal'
      }, { id: '999' });
      const res = createMockResponse();
      cardService.updateCard.mockResolvedValue(null);

      // Act
      await updateCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tarjeta no encontrada'
      });
    });
  });

  describe('deleteCard', () => {
    it('debería eliminar una tarjeta exitosamente', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      cardService.deleteCard.mockResolvedValue(true);

      // Act
      await deleteCard(req, res);

      // Assert
      expect(cardService.deleteCard).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tarjeta eliminada exitosamente'
      });
    });

    it('debería retornar error 404 cuando la tarjeta no existe', async () => {
      // Arrange
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      cardService.deleteCard.mockResolvedValue(false);

      // Act
      await deleteCard(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tarjeta no encontrada'
      });
    });
  });

  describe('listCards', () => {
    it('debería listar todas las tarjetas exitosamente', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      const mockCards = [
        { id: 1, color: 'red', value: '5', type: 'normal' },
        { id: 2, color: 'blue', value: '7', type: 'normal' }
      ];
      cardService.listCards.mockResolvedValue(mockCards);

      // Act
      await listCards(req, res);

      // Assert
      expect(cardService.listCards).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería manejar errores internos', async () => {
      // Arrange
      const req = createMockRequest();
      const res = createMockResponse();
      cardService.listCards.mockRejectedValue(new Error('Database error'));

      // Act
      await listCards(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al listar tarjetas'
      });
    });
  });
}); 