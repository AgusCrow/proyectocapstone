jest.mock('../../src/services/gameService.js', () => ({
  __esModule: true,
  default: {
    createGame: jest.fn(),
    getGameById: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
    listGames: jest.fn(),
    addPlayerToGame: jest.fn(),
    removePlayerFromGame: jest.fn(),
    startGame: jest.fn(),
    endGame: jest.fn(),
    getPlayersInGame: jest.fn(),
    finishGame: jest.fn(),
    dealCardsToPlayers: jest.fn(),
    playCardWithRules: jest.fn(),
    drawCardForPlayer: jest.fn(),
    sayUno: jest.fn(),
    challengeUno: jest.fn(),
    endPlayerTurn: jest.fn(),
    checkGameEnd: jest.fn(),
    getGameStatus: jest.fn(),
    getMoveHistory: jest.fn(),
    getPlayerCards: jest.fn(),
    getPlayerScores: jest.fn(),
    handleMultiplayer: jest.fn(),
    logGameError: jest.fn(),
    playSkipCard: jest.fn(),
    playReverseCard: jest.fn(),
    drawUntilPlayable: jest.fn()
  }
}));

// Funciones puras para testing
const createMockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user,
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
import gamesController from '../../src/controllers/gamesController.js';
import gameService from '../../src/services/gameService.js';

describe('Games Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('debería crear un juego exitosamente', async () => {
      const req = createMockRequest({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Test Game', 
        rules: 'Test rules',
        maxPlayers: 4,
        status: 'waiting'
      };
      gameService.createGame.mockResolvedValue(mockGame);
      
      await gamesController.createGame(req, res);
      
      expect(gameService.createGame).toHaveBeenCalledWith({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería manejar errores internos', async () => {
      const req = createMockRequest({
        name: 'Test Game',
        rules: 'Test rules',
        maxPlayers: 4
      });
      const res = createMockResponse();
      gameService.createGame.mockRejectedValue(new Error('Database error'));
      
      await gamesController.createGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno al crear juego'
      });
    });
  });

  describe('getGameById', () => {
    it('debería obtener un juego exitosamente', async () => {
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Test Game', 
        status: 'waiting' 
      };
      gameService.getGameById.mockResolvedValue(mockGame);
      
      await gamesController.getGameById(req, res);
      
      expect(gameService.getGameById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      gameService.getGameById.mockResolvedValue(null);
      
      await gamesController.getGameById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('updateGame', () => {
    it('debería actualizar un juego exitosamente', async () => {
      const req = createMockRequest({
        name: 'Updated Game',
        rules: 'Updated rules'
      }, { id: '1' });
      const res = createMockResponse();
      const mockGame = { 
        id: 1, 
        name: 'Updated Game', 
        rules: 'Updated rules' 
      };
      gameService.updateGame.mockResolvedValue(mockGame);
      
      await gamesController.updateGame(req, res);
      
      expect(gameService.updateGame).toHaveBeenCalledWith('1', {
        name: 'Updated Game',
        rules: 'Updated rules'
      });
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({
        name: 'Updated Game'
      }, { id: '999' });
      const res = createMockResponse();
      gameService.updateGame.mockResolvedValue(null);
      
      await gamesController.updateGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('deleteGame', () => {
    it('debería eliminar un juego exitosamente', async () => {
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      gameService.deleteGame.mockResolvedValue(true);
      
      await gamesController.deleteGame(req, res);
      
      expect(gameService.deleteGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Juego eliminado exitosamente'
      });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { id: '999' });
      const res = createMockResponse();
      gameService.deleteGame.mockResolvedValue(false);
      
      await gamesController.deleteGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('listGames', () => {
    it('debería listar todos los juegos exitosamente', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockGames = [
        { id: 1, name: 'Game 1', status: 'waiting' },
        { id: 2, name: 'Game 2', status: 'in_progress' }
      ];
      gameService.listGames.mockResolvedValue(mockGames);
      
      await gamesController.listGames(req, res);
      
      expect(gameService.listGames).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockGames);
    });
  });

  describe('addPlayerToGame', () => {
    it('debería agregar un jugador exitosamente', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '1' });
      const res = createMockResponse();
      gameService.addPlayerToGame.mockResolvedValue(true);
      
      await gamesController.addPlayerToGame(req, res);
      
      expect(gameService.addPlayerToGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Jugador agregado exitosamente'
      });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '999' });
      const res = createMockResponse();
      gameService.addPlayerToGame.mockResolvedValue(null);
      
      await gamesController.addPlayerToGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando el jugador ya está en el juego', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '1' });
      const res = createMockResponse();
      gameService.addPlayerToGame.mockResolvedValue('already_joined');
      
      await gamesController.addPlayerToGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El jugador ya está en el juego'
      });
    });
  });

  describe('getPlayersInGame', () => {
    it('debería obtener jugadores exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      const mockPlayers = [
        { id: 1, username: 'player1' },
        { id: 2, username: 'player2' }
      ];
      gameService.getPlayersInGame.mockResolvedValue(mockPlayers);
      
      await gamesController.getPlayersInGame(req, res);
      
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockPlayers);
    });
  });

  describe('startGame', () => {
    it('debería iniciar un juego exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue({ message: 'Juego iniciado' });
      
      await gamesController.startGame(req, res);
      
      expect(gameService.startGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Juego iniciado' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue(null);
      
      await gamesController.startGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 403 cuando el usuario no es el creador', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 2 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue('not_creator');
      
      await gamesController.startGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Solo el creador puede iniciar el juego'
      });
    });

    it('debería retornar error 400 cuando no hay jugadores', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.startGame.mockResolvedValue('no_players');
      
      await gamesController.startGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No hay jugadores en el juego'
      });
    });
  });

  describe('finishGame', () => {
    it('debería finalizar un juego exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      const mockGame = { id: 1, status: 'finished' };
      gameService.finishGame.mockResolvedValue(mockGame);
      
      await gamesController.finishGame(req, res);
      
      expect(gameService.finishGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' });
      const res = createMockResponse();
      gameService.finishGame.mockResolvedValue(null);
      
      await gamesController.finishGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('removePlayerFromGame', () => {
    it('debería remover un jugador exitosamente', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '1' });
      const res = createMockResponse();
      gameService.removePlayerFromGame.mockResolvedValue(true);
      
      await gamesController.removePlayerFromGame(req, res);
      
      expect(gameService.removePlayerFromGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Jugador removido exitosamente'
      });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '999' });
      const res = createMockResponse();
      gameService.removePlayerFromGame.mockResolvedValue(null);
      
      await gamesController.removePlayerFromGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando el jugador no está en el juego', async () => {
      const req = createMockRequest({ playerId: 1 }, { gameId: '1' });
      const res = createMockResponse();
      gameService.removePlayerFromGame.mockResolvedValue('not_in_game');
      
      await gamesController.removePlayerFromGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El jugador no está en el juego'
      });
    });
  });

  describe('endGame', () => {
    it('debería finalizar un juego exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.endGame.mockResolvedValue({ message: 'Juego finalizado' });
      
      await gamesController.endGame(req, res);
      
      expect(gameService.endGame).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Juego finalizado' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.endGame.mockResolvedValue(null);
      
      await gamesController.endGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 403 cuando el usuario no es el creador', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 2 });
      const res = createMockResponse();
      gameService.endGame.mockResolvedValue('not_creator');
      
      await gamesController.endGame(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Solo el creador puede finalizar el juego'
      });
    });
  });

  describe('dealCardsToPlayers', () => {
    it('debería repartir cartas exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.dealCardsToPlayers.mockResolvedValue({ message: 'Cartas repartidas' });
      
      await gamesController.dealCardsToPlayers(req, res);
      
      expect(gameService.dealCardsToPlayers).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cartas repartidas' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.dealCardsToPlayers.mockResolvedValue(null);
      
      await gamesController.dealCardsToPlayers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 403 cuando el usuario no es el creador', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 2 });
      const res = createMockResponse();
      gameService.dealCardsToPlayers.mockResolvedValue('not_creator');
      
      await gamesController.dealCardsToPlayers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Solo el creador puede repartir cartas'
      });
    });

    it('debería retornar error 400 cuando el juego no ha iniciado', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.dealCardsToPlayers.mockResolvedValue('game_not_started');
      
      await gamesController.dealCardsToPlayers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El juego no ha iniciado'
      });
    });

    it('debería retornar error 400 cuando no hay jugadores', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.dealCardsToPlayers.mockResolvedValue('no_players');
      
      await gamesController.dealCardsToPlayers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No hay jugadores en el juego'
      });
    });
  });

  describe('playCardWithRules', () => {
    it('debería jugar una carta exitosamente', async () => {
      const req = createMockRequest(
        { cardId: 'card123', color: 'red' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.playCardWithRules.mockResolvedValue({ message: 'Carta jugada' });
      
      await gamesController.playCardWithRules(req, res);
      
      expect(gameService.playCardWithRules).toHaveBeenCalledWith('1', 1, 'card123', 'red');
      expect(res.json).toHaveBeenCalledWith({ message: 'Carta jugada' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest(
        { cardId: 'card123', color: 'red' }, 
        { gameId: '999' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.playCardWithRules.mockResolvedValue(null);
      
      await gamesController.playCardWithRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando no es el turno del jugador', async () => {
      const req = createMockRequest(
        { cardId: 'card123', color: 'red' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.playCardWithRules.mockResolvedValue('not_player_turn');
      
      await gamesController.playCardWithRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No es tu turno'
      });
    });

    it('debería retornar error 404 cuando la carta no existe', async () => {
      const req = createMockRequest(
        { cardId: 'invalid_card', color: 'red' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.playCardWithRules.mockResolvedValue('card_not_found');
      
      await gamesController.playCardWithRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Carta no encontrada'
      });
    });

    it('debería retornar error 400 cuando el movimiento es inválido', async () => {
      const req = createMockRequest(
        { cardId: 'card123', color: 'red' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.playCardWithRules.mockResolvedValue('invalid_card');
      
      await gamesController.playCardWithRules(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Movimiento inválido según reglas UNO'
      });
    });
  });

  describe('drawCardForPlayer', () => {
    it('debería robar una carta exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.drawCardForPlayer.mockResolvedValue({ card: 'Red 5' });
      
      await gamesController.drawCardForPlayer(req, res);
      
      expect(gameService.drawCardForPlayer).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ card: 'Red 5' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.drawCardForPlayer.mockResolvedValue(null);
      
      await gamesController.drawCardForPlayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando el juego no ha iniciado', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.drawCardForPlayer.mockResolvedValue('game_not_started');
      
      await gamesController.drawCardForPlayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El juego no ha iniciado'
      });
    });

    it('debería retornar error 400 cuando no es el turno del jugador', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.drawCardForPlayer.mockResolvedValue('not_player_turn');
      
      await gamesController.drawCardForPlayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No es tu turno'
      });
    });
  });

  describe('sayUno', () => {
    it('debería decir UNO exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.sayUno.mockResolvedValue({ message: 'UNO!' });
      
      await gamesController.sayUno(req, res);
      
      expect(gameService.sayUno).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'UNO!' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.sayUno.mockResolvedValue(null);
      
      await gamesController.sayUno(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 404 cuando el jugador no existe', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 999 });
      const res = createMockResponse();
      gameService.sayUno.mockResolvedValue('player_not_found');
      
      await gamesController.sayUno(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Jugador no encontrado'
      });
    });

    it('debería retornar error 400 cuando el estado de UNO es inválido', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.sayUno.mockResolvedValue('invalid_uno_state');
      
      await gamesController.sayUno(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No tienes exactamente una carta'
      });
    });
  });

  describe('challengeUno', () => {
    it('debería desafiar UNO exitosamente', async () => {
      const req = createMockRequest(
        { challengedPlayerId: 2 }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.challengeUno.mockResolvedValue({ message: 'Desafío exitoso' });
      
      await gamesController.challengeUno(req, res);
      
      expect(gameService.challengeUno).toHaveBeenCalledWith('1', 1, 2);
      expect(res.json).toHaveBeenCalledWith({ message: 'Desafío exitoso' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest(
        { challengedPlayerId: 2 }, 
        { gameId: '999' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.challengeUno.mockResolvedValue(null);
      
      await gamesController.challengeUno(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 404 cuando el jugador no existe', async () => {
      const req = createMockRequest(
        { challengedPlayerId: 999 }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.challengeUno.mockResolvedValue('player_not_found');
      
      await gamesController.challengeUno(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Jugador no encontrado'
      });
    });
  });

  describe('endPlayerTurn', () => {
    it('debería finalizar turno exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.endPlayerTurn.mockResolvedValue({ message: 'Turno finalizado' });
      
      await gamesController.endPlayerTurn(req, res);
      
      expect(gameService.endPlayerTurn).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Turno finalizado' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.endPlayerTurn.mockResolvedValue(null);
      
      await gamesController.endPlayerTurn(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando no es el turno del jugador', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      gameService.endPlayerTurn.mockResolvedValue('not_player_turn');
      
      await gamesController.endPlayerTurn(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No es tu turno'
      });
    });
  });

  describe('checkGameEnd', () => {
    it('debería verificar fin de juego exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      gameService.checkGameEnd.mockResolvedValue({ gameEnded: true, winner: 1 });
      
      await gamesController.checkGameEnd(req, res);
      
      expect(gameService.checkGameEnd).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ gameEnded: true, winner: 1 });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' });
      const res = createMockResponse();
      gameService.checkGameEnd.mockResolvedValue(null);
      
      await gamesController.checkGameEnd(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('getGameStatus', () => {
    it('debería obtener estado del juego exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      const mockStatus = {
        game_id: 1,
        status: 'in_progress',
        current_player: 'player1',
        top_card: 'Red 5'
      };
      gameService.getGameStatus.mockResolvedValue(mockStatus);
      
      await gamesController.getGameStatus(req, res);
      
      expect(gameService.getGameStatus).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockStatus);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' });
      const res = createMockResponse();
      gameService.getGameStatus.mockResolvedValue(null);
      
      await gamesController.getGameStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('getMoveHistory', () => {
    it('debería obtener historial de movimientos exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      const mockHistory = [
        { player: 'player1', action: 'played Red 5' },
        { player: 'player2', action: 'drew a card' }
      ];
      gameService.getMoveHistory.mockResolvedValue(mockHistory);
      
      await gamesController.getMoveHistory(req, res);
      
      expect(gameService.getMoveHistory).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' });
      const res = createMockResponse();
      gameService.getMoveHistory.mockResolvedValue(null);
      
      await gamesController.getMoveHistory(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('getPlayerCards', () => {
    it('debería obtener cartas del jugador exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 1 });
      const res = createMockResponse();
      const mockCards = [
        { id: 'card1', color: 'red', value: '5' },
        { id: 'card2', color: 'blue', value: '7' }
      ];
      gameService.getPlayerCards.mockResolvedValue(mockCards);
      
      await gamesController.getPlayerCards(req, res);
      
      expect(gameService.getPlayerCards).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith(mockCards);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' }, { id: 1 });
      const res = createMockResponse();
      gameService.getPlayerCards.mockResolvedValue(null);
      
      await gamesController.getPlayerCards(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando el jugador no está en el juego', async () => {
      const req = createMockRequest({}, { gameId: '1' }, { id: 999 });
      const res = createMockResponse();
      gameService.getPlayerCards.mockResolvedValue('player_not_in_game');
      
      await gamesController.getPlayerCards(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No estás en este juego'
      });
    });
  });

  describe('getPlayerScores', () => {
    it('debería obtener puntuaciones de jugadores exitosamente', async () => {
      const req = createMockRequest({}, { gameId: '1' });
      const res = createMockResponse();
      const mockScores = {
        game_id: '1',
        scores: {
          'player1': 100,
          'player2': 50
        }
      };
      gameService.getPlayerScores.mockResolvedValue(mockScores);
      
      await gamesController.getPlayerScores(req, res);
      
      expect(gameService.getPlayerScores).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockScores);
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest({}, { gameId: '999' });
      const res = createMockResponse();
      gameService.getPlayerScores.mockResolvedValue(null);
      
      await gamesController.getPlayerScores(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('handleMultiplayer', () => {
    it('debería manejar acción multijugador exitosamente', async () => {
      const req = createMockRequest(
        { action: 'join' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.handleMultiplayer.mockResolvedValue({ message: 'Acción completada' });
      
      await gamesController.handleMultiplayer(req, res);
      
      expect(gameService.handleMultiplayer).toHaveBeenCalledWith('1', 1, 'join');
      expect(res.json).toHaveBeenCalledWith({ message: 'Acción completada' });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest(
        { action: 'join' }, 
        { gameId: '999' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.handleMultiplayer.mockResolvedValue(null);
      
      await gamesController.handleMultiplayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });

    it('debería retornar error 400 cuando la acción es inválida', async () => {
      const req = createMockRequest(
        { action: 'invalid_action' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.handleMultiplayer.mockResolvedValue('invalid_action');
      
      await gamesController.handleMultiplayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acción inválida'
      });
    });
  });

  describe('logGameError', () => {
    it('debería registrar error exitosamente', async () => {
      const req = createMockRequest(
        { error: 'Test error', context: 'Testing' }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.logGameError.mockResolvedValue(123);
      
      await gamesController.logGameError(req, res);
      
      expect(gameService.logGameError).toHaveBeenCalledWith('1', 1, 'Test error', 'Testing');
      expect(res.json).toHaveBeenCalledWith({ log_id: 123 });
    });

    it('debería retornar error 404 cuando el juego no existe', async () => {
      const req = createMockRequest(
        { error: 'Test error', context: 'Testing' }, 
        { gameId: '999' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      gameService.logGameError.mockResolvedValue(null);
      
      await gamesController.logGameError(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Juego no encontrado'
      });
    });
  });

  describe('playSkipCard', () => {
    it('debería jugar carta de salto exitosamente', async () => {
      const req = createMockRequest(
        { 
          cardPlayed: { color: 'red', value: 'skip' },
          currentPlayerIndex: 0,
          players: ['player1', 'player2'],
          direction: 1
        }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      const mockResult = {
        nextPlayerIndex: 1,
        message: 'Saltado al siguiente jugador'
      };
      gameService.playSkipCard.mockResolvedValue(mockResult);
      
      await gamesController.playSkipCard(req, res);
      
      expect(gameService.playSkipCard).toHaveBeenCalledWith(
        { color: 'red', value: 'skip' },
        0,
        ['player1', 'player2'],
        1
      );
      expect(res.json).toHaveBeenCalledWith({
        ...mockResult,
        gameId: '1',
        playerId: 1
      });
    });
  });

  describe('playReverseCard', () => {
    it('debería jugar carta de reversa exitosamente', async () => {
      const req = createMockRequest(
        { 
          cardPlayed: { color: 'blue', value: 'reverse' },
          currentPlayerIndex: 0,
          players: ['player1', 'player2'],
          direction: 1
        }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      const mockResult = {
        newDirection: -1,
        message: 'Dirección del juego invertida'
      };
      gameService.playReverseCard.mockResolvedValue(mockResult);
      
      await gamesController.playReverseCard(req, res);
      
      expect(gameService.playReverseCard).toHaveBeenCalledWith(
        { color: 'blue', value: 'reverse' },
        0,
        ['player1', 'player2'],
        1
      );
      expect(res.json).toHaveBeenCalledWith({
        ...mockResult,
        gameId: '1',
        playerId: 1
      });
    });
  });

  describe('drawUntilPlayable', () => {
    it('debería robar hasta tener carta jugable exitosamente', async () => {
      const req = createMockRequest(
        { 
          playerHand: ['card1', 'card2'],
          deck: ['card3', 'card4'],
          currentCard: { color: 'red', value: '5' }
        }, 
        { gameId: '1' }, 
        { id: 1 }
      );
      const res = createMockResponse();
      const mockResult = {
        newHand: ['card1', 'card2', 'card3'],
        drawnCards: ['card3']
      };
      gameService.drawUntilPlayable.mockResolvedValue(mockResult);
      
      await gamesController.drawUntilPlayable(req, res);
      
      expect(gameService.drawUntilPlayable).toHaveBeenCalledWith(
        ['card1', 'card2'],
        ['card3', 'card4'],
        { color: 'red', value: '5' }
      );
      expect(res.json).toHaveBeenCalledWith({
        ...mockResult,
        gameId: '1',
        playerId: 1
      });
    });
  });

  describe('getCurrentPlayer', () => {
    it('debería obtener jugador actual exitosamente', async () => {
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      const mockPlayers = [
        { username: 'player1' },
        { username: 'player2' }
      ];
      gameService.getPlayersInGame.mockResolvedValue(mockPlayers);
      
      await gamesController.getCurrentPlayer(req, res);
      
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        current_player: 'player1'
      });
    });

    it('debería retornar error 404 cuando no hay jugadores', async () => {
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      gameService.getPlayersInGame.mockResolvedValue([]);
      
      await gamesController.getCurrentPlayer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No hay jugadores en el juego'
      });
    });
  });

  describe('getTopCard', () => {
    it('debería obtener carta superior exitosamente', async () => {
      const req = createMockRequest({}, { id: '1' });
      const res = createMockResponse();
      
      await gamesController.getTopCard(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        game_id: '1',
        top_card: 'Red 5'
      });
    });
  });
});