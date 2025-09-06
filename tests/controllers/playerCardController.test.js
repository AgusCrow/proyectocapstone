import playerCardController from '../controllers/playerCardController.js';
import playerCardService from '../services/playerCardService.js';

// Mock the playerCardService
jest.mock('../services/playerCardService.js');

describe('playerCardController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'player123' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('getPlayerHand', () => {
    it('should return player hand successfully', async () => {
      req.params.gameId = 'game1';
      const mockHand = [{ id: 'card1', value: '5' }];
      playerCardService.getPlayerHand.mockResolvedValue(mockHand);
      
      await playerCardController.getPlayerHand(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        game_id: 'game1',
        player_id: 'player123',
        cards: mockHand
      });
    });

    it('should handle service errors', async () => {
      req.params.gameId = 'game1';
      const error = new Error('Service error');
      playerCardService.getPlayerHand.mockRejectedValue(error);
      
      await playerCardController.getPlayerHand(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener las cartas en mano' });
    });
  });

  describe('playCard', () => {
    it('should play card successfully', async () => {
      req.body.playerCardId = 'card123';
      const mockPlayedCard = {
        id: 'card123',
        Card: { id: 'card1', value: '5' },
        playedAt: new Date()
      };
      playerCardService.playCard.mockResolvedValue(mockPlayedCard);
      
      await playerCardController.playCard(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        message: 'Carta jugada exitosamente',
        card: {
          id: 'card123',
          card: { id: 'card1', value: '5' },
          playedAt: mockPlayedCard.playedAt
        }
      });
    });

    it('should return 400 if playerCardId is missing', async () => {
      await playerCardController.playCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID de carta requerido' });
    });

    it('should handle card not found error', async () => {
      req.body.playerCardId = 'invalid';
      const error = new Error('Carta no encontrada o ya jugada');
      playerCardService.playCard.mockRejectedValue(error);
      
      await playerCardController.playCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should handle general service errors', async () => {
      req.body.playerCardId = 'card123';
      const error = new Error('Service error');
      playerCardService.playCard.mockRejectedValue(error);
      
      await playerCardController.playCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al jugar la carta' });
    });
  });

  describe('drawCard', () => {
    it('should draw card successfully', async () => {
      req.params.gameId = 'game1';
      const mockCard = { id: 'card1', value: '7' };
      playerCardService.drawCard.mockResolvedValue(mockCard);
      
      await playerCardController.drawCard(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        message: 'Carta robada exitosamente',
        card: mockCard
      });
    });

    it('should handle no cards available', async () => {
      req.params.gameId = 'game1';
      const error = new Error('No hay cartas disponibles para robar');
      playerCardService.drawCard.mockRejectedValue(error);
      
      await playerCardController.drawCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should handle general service errors', async () => {
      req.params.gameId = 'game1';
      const error = new Error('Service error');
      playerCardService.drawCard.mockRejectedValue(error);
      
      await playerCardController.drawCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al robar carta' });
    });
  });

  describe('getPlayedCards', () => {
    it('should return played cards successfully', async () => {
      req.params.gameId = 'game1';
      const mockCards = [{ id: 'card1', value: '5' }];
      playerCardService.getPlayedCards.mockResolvedValue(mockCards);
      
      await playerCardController.getPlayedCards(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        game_id: 'game1',
        played_cards: mockCards
      });
    });

    it('should handle service errors', async () => {
      req.params.gameId = 'game1';
      const error = new Error('Service error');
      playerCardService.getPlayedCards.mockRejectedValue(error);
      
      await playerCardController.getPlayedCards(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener cartas jugadas' });
    });
  });

  describe('getLastPlayedCard', () => {
    it('should return last played card successfully', async () => {
      req.params.gameId = 'game1';
      const mockCard = { id: 'card1', value: '5' };
      playerCardService.getLastPlayedCard.mockResolvedValue(mockCard);
      
      await playerCardController.getLastPlayedCard(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        game_id: 'game1',
        last_card: mockCard
      });
    });

    it('should handle no played cards', async () => {
      req.params.gameId = 'game1';
      playerCardService.getLastPlayedCard.mockResolvedValue(null);
      
      await playerCardController.getLastPlayedCard(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        game_id: 'game1',
        last_card: null,
        message: 'No hay cartas jugadas aún'
      });
    });

    it('should handle service errors', async () => {
      req.params.gameId = 'game1';
      const error = new Error('Service error');
      playerCardService.getLastPlayedCard.mockRejectedValue(error);
      
      await playerCardController.getLastPlayedCard(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener la última carta jugada' });
    });
  });
});