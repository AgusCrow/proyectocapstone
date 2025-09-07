import { jest } from '@jest/globals';
import gameService from "../../src/services/gameService";
import { Game, Player } from "../../src/orm/index";
import cardService from "../../src/services/cardService";
import playerCardService from "../../src/services/playerCardService";

// Mock de los modelos y servicios
jest.mock("../../src/orm/index", () => ({
  Game: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  Player: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../../src/services/cardService", () => ({
  initDeck: jest.fn(),
  dealCardToPlayer: jest.fn(),
  drawCardFromDeck: jest.fn(),
  getTopCard: jest.fn(),
  drawMultipleCards: jest.fn(),
}));

jest.mock("../../src/services/playerCardService", () => ({
  getPlayerCard: jest.fn(),
  playCard: jest.fn(),
  getPlayerCards: jest.fn(),
  setUnoStatus: jest.fn(),
  getUnoStatus: jest.fn(),
  dealCardsToAllPlayers: jest.fn(),
}));

describe("gameService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para funciones CRUD básicas
  describe("createGame", () => {
    it("debería crear un nuevo juego exitosamente", async () => {
      const data = { name: "Test Game", creatorId: 1 };
      const mockGame = { id: 1, name: "Test Game", status: "waiting", creatorId: 1 };
      Game.create.mockResolvedValue(mockGame);
      
      const result = await gameService.createGame(data);
      
      expect(Game.create).toHaveBeenCalledWith({
        name: data.name,
        status: "waiting",
        creatorId: data.creatorId,
      });
      expect(result).toEqual(mockGame);
    });
  });

  describe("getGameById", () => {
    it("debería obtener un juego por ID exitosamente", async () => {
      const gameId = 1;
      const mockGame = { id: 1, name: "Test Game" };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.getGameById(gameId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(result).toEqual(mockGame);
    });
  });

  describe("updateGame", () => {
    it("debería actualizar un juego exitosamente", async () => {
      const gameId = 1;
      const data = { name: "Updated Game" };
      const mockGame = { 
        id: 1, 
        name: "Test Game", 
        update: jest.fn().mockResolvedValue({ id: 1, name: "Updated Game" })
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.updateGame(gameId, data);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(mockGame.update).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, name: "Updated Game" });
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.updateGame(gameId, { name: "Updated Game" });
      
      expect(result).toBeNull();
    });
  });

  describe("deleteGame", () => {
    it("debería eliminar un juego exitosamente", async () => {
      const gameId = 1;
      const mockGame = { 
        id: 1, 
        name: "Test Game", 
        destroy: jest.fn().mockResolvedValue(true)
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.deleteGame(gameId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(mockGame.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.deleteGame(gameId);
      
      expect(result).toBeNull();
    });
  });

  describe("listGames", () => {
    it("debería listar todos los juegos exitosamente", async () => {
      const mockGames = [
        { id: 1, name: "Game 1" },
        { id: 2, name: "Game 2" }
      ];
      Game.findAll.mockResolvedValue(mockGames);
      
      const result = await gameService.listGames();
      
      expect(Game.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockGames);
    });
  });

  // Pruebas para gestión de jugadores
  describe("addPlayerToGame", () => {
    it("debería agregar un jugador a un juego exitosamente", async () => {
      const gameId = 1;
      const playerId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([]),
        addPlayer: jest.fn().mockResolvedValue(true)
      };
      const mockPlayer = { id: 1, username: "player1" };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(mockPlayer);
      
      const result = await gameService.addPlayerToGame(gameId, playerId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(Player.findByPk).toHaveBeenCalledWith(playerId);
      expect(mockGame.addPlayer).toHaveBeenCalledWith(mockPlayer);
      expect(result).toBe(true);
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      const playerId = 1;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.addPlayerToGame(gameId, playerId);
      
      expect(result).toBeNull();
    });

    it("debería retornar 'already_joined' cuando el jugador ya está en el juego", async () => {
      const gameId = 1;
      const playerId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([{ id: 1, username: "player1" }])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.addPlayerToGame(gameId, playerId);
      
      expect(result).toBe("already_joined");
    });

    it("debería retornar null cuando el jugador no existe", async () => {
      const gameId = 1;
      const playerId = 999;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(null);
      
      const result = await gameService.addPlayerToGame(gameId, playerId);
      
      expect(result).toBeNull();
    });
  });

  describe("getCardValue", () => {
    it("debería retornar el valor correcto para cartas numéricas", () => {
      expect(gameService.getCardValue("red_5")).toBe(5);
      expect(gameService.getCardValue("blue_0")).toBe(0);
      expect(gameService.getCardValue("green_9")).toBe(9);
    });

    it("debería retornar 20 para cartas de acción", () => {
      expect(gameService.getCardValue("blue_skip")).toBe(20);
      expect(gameService.getCardValue("green_reverse")).toBe(20);
      expect(gameService.getCardValue("yellow_draw2")).toBe(20);
    });

    it("debería retornar 50 para cartas comodín", () => {
      expect(gameService.getCardValue("wild")).toBe(50);
      expect(gameService.getCardValue("wild_draw4")).toBe(50);
    });

    it("debería retornar 10 para cartas con letras", () => {
      expect(gameService.getCardValue("red_A")).toBe(10);
      expect(gameService.getCardValue("blue_B")).toBe(10);
    });

    it("debería retornar 0 para cartas inválidas", () => {
      expect(gameService.getCardValue("invalid_card")).toBe(0);
      expect(gameService.getCardValue("")).toBe(0);
      expect(gameService.getCardValue(null)).toBe(0);
      expect(gameService.getCardValue(undefined)).toBe(0);
    });
  });

  describe("getCurrentPlayer", () => {
    it("debería obtener el jugador actual exitosamente", async () => {
      const gameId = 1;
      const mockPlayers = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" }
      ];
      const mockGame = {
        id: 1,
        currentPlayerId: 1,
        getPlayers: jest.fn().mockResolvedValue(mockPlayers)
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.getCurrentPlayer(gameId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(result).toEqual({ id: 1, username: "player1" });
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.getCurrentPlayer(gameId);
      
      expect(result).toBeNull();
    });

    it("debería retornar null cuando no hay jugador actual", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        currentPlayerId: null
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.getCurrentPlayer(gameId);
      
      expect(result).toBeNull();
    });
  });

  describe("startGame", () => {
    it("debería iniciar un juego exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: "waiting",
        getPlayers: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
        update: jest.fn().mockResolvedValue({ status: "started" })
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.startGame(gameId, userId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(cardService.initDeck).toHaveBeenCalled();
      expect(playerCardService.dealCardsToAllPlayers).toHaveBeenCalledWith(gameId);
      expect(result.status).toBe("started");
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.startGame(gameId, 1);
      
      expect(result).toBeNull();
    });

    it("debería retornar 'not_creator' cuando el usuario no es el creador", async () => {
      const gameId = 1;
      const userId = 2;
      const mockGame = { id: 1, creatorId: 1 };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.startGame(gameId, userId);
      
      expect(result).toBe("not_creator");
    });

    it("debería retornar 'no_players' cuando no hay jugadores", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        getPlayers: jest.fn().mockResolvedValue([])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.startGame(gameId, userId);
      
      expect(result).toBe("no_players");
    });
  });

  describe("removePlayerFromGame", () => {
    it("debería remover un jugador exitosamente", async () => {
      const gameId = 1;
      const playerId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([{ id: 1 }]),
        removePlayer: jest.fn().mockResolvedValue(true)
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.removePlayerFromGame(gameId, playerId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(mockGame.removePlayer).toHaveBeenCalledWith(playerId);
      expect(result).toBe(true);
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.removePlayerFromGame(gameId, 1);
      
      expect(result).toBeNull();
    });

    it("debería retornar 'not_in_game' cuando el jugador no está en el juego", async () => {
      const gameId = 1;
      const playerId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([{ id: 2 }])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.removePlayerFromGame(gameId, playerId);
      
      expect(result).toBe("not_in_game");
    });
  });

  describe("playCardWithRules", () => {
    beforeEach(() => {
      gameService.isPlayerTurn = jest.fn().mockResolvedValue(true);
      gameService.validateCardPlay = jest.fn().mockResolvedValue(true);
    });

    it("debería jugar una carta exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const cardId = "red_5";
      const color = "red";
      const mockGame = { id: 1, status: "started" };
      const mockGameState = { game_id: 1, status: "started" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCard.mockResolvedValue({ id: cardId });
      playerCardService.playCard.mockResolvedValue(true);
      gameService.getGameStatus = jest.fn().mockResolvedValue(mockGameState);
      
      const result = await gameService.playCardWithRules(gameId, userId, cardId, color);
      
      expect(playerCardService.playCard).toHaveBeenCalledWith(gameId, userId, cardId, color);
      expect(result).toEqual(mockGameState);
    });

    it("debería retornar 'not_player_turn' cuando no es el turno del jugador", async () => {
      gameService.isPlayerTurn.mockResolvedValue(false);
      
      const result = await gameService.playCardWithRules(1, 1, "red_5", "red");
      
      expect(result).toBe("not_player_turn");
    });

    it("debería retornar 'card_not_found' cuando el jugador no tiene la carta", async () => {
      const gameId = 1;
      const userId = 1;
      const cardId = "red_5";
      const mockGame = { id: 1, status: "started" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCard.mockResolvedValue(null);
      
      const result = await gameService.playCardWithRules(gameId, userId, cardId, "red");
      
      expect(result).toBe("card_not_found");
    });

    it("debería retornar 'invalid_card' cuando la jugada no es válida", async () => {
      gameService.validateCardPlay.mockResolvedValue(false);
      
      const result = await gameService.playCardWithRules(1, 1, "red_5", "red");
      
      expect(result).toBe("invalid_card");
    });
  });

  describe("drawCardForPlayer", () => {
    it("debería robar una carta exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = { id: 1, status: "started" };
      const mockCard = { id: "blue_3" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      gameService.isPlayerTurn = jest.fn().mockResolvedValue(true);
      cardService.drawCardFromDeck.mockResolvedValue(mockCard);
      
      const result = await gameService.drawCardForPlayer(gameId, userId);
      
      expect(cardService.drawCardFromDeck).toHaveBeenCalledWith(gameId, userId);
      expect(result).toEqual(mockCard);
    });

    it("debería retornar 'game_not_started' cuando el juego no ha iniciado", async () => {
      const gameId = 1;
      const mockGame = { id: 1, status: "waiting" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.drawCardForPlayer(gameId, 1);
      
      expect(result).toBe("game_not_started");
    });

    it("debería retornar 'not_player_turn' cuando no es el turno del jugador", async () => {
      const gameId = 1;
      const mockGame = { id: 1, status: "started" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      gameService.isPlayerTurn = jest.fn().mockResolvedValue(false);
      
      const result = await gameService.drawCardForPlayer(gameId, 1);
      
      expect(result).toBe("not_player_turn");
    });
  });

  describe("sayUno", () => {
    it("debería declarar UNO exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([{ id: 1, username: "player1" }])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards.mockResolvedValue([{ id: "red_5" }]);
      playerCardService.setUnoStatus.mockResolvedValue(true);
      playerCardService.getUnoStatus.mockResolvedValue(false);
      
      const result = await gameService.sayUno(gameId, userId);
      
      expect(playerCardService.setUnoStatus).toHaveBeenCalledWith(gameId, userId, true);
      expect(result.uno_declared).toBe(true);
    });

    it("debería retornar 'invalid_uno_state' cuando el jugador no tiene exactamente 1 carta", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([{ id: 1, username: "player1" }])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards.mockResolvedValue([{ id: "red_5" }, { id: "blue_3" }]);
      
      const result = await gameService.sayUno(gameId, userId);
      
      expect(result).toBe("invalid_uno_state");
    });
  });

  describe("challengeUno", () => {
    it("debería desafiar UNO exitosamente cuando el jugador no lo dijo", async () => {
      const gameId = 1;
      const userId = 1;
      const challengedPlayerId = 2;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards.mockResolvedValue([{ id: "red_5" }]);
      playerCardService.getUnoStatus.mockResolvedValue(false);
      cardService.drawMultipleCards.mockResolvedValue(true);
      
      const result = await gameService.challengeUno(gameId, userId, challengedPlayerId);
      
      expect(cardService.drawMultipleCards).toHaveBeenCalledWith(gameId, challengedPlayerId, 2);
      expect(result.challenge_success).toBe(true);
    });

    it("debería fallar el desafío cuando el jugador sí dijo UNO", async () => {
      const gameId = 1;
      const userId = 1;
      const challengedPlayerId = 2;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards.mockResolvedValue([{ id: "red_5" }]);
      playerCardService.getUnoStatus.mockResolvedValue(true);
      cardService.drawMultipleCards.mockResolvedValue(true);
      
      const result = await gameService.challengeUno(gameId, userId, challengedPlayerId);
      
      expect(cardService.drawMultipleCards).toHaveBeenCalledWith(gameId, userId, 2);
      expect(result.challenge_success).toBe(false);
    });
  });

  describe("endPlayerTurn", () => {
    it("debería finalizar el turno del jugador exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        currentPlayerId: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ]),
        update: jest.fn().mockResolvedValue({ currentPlayerId: 2 })
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      gameService.getCurrentPlayerIndex = jest.fn().mockResolvedValue(0);
      gameService.isPlayerTurn = jest.fn().mockResolvedValue(true);
      
      const result = await gameService.endPlayerTurn(gameId, userId);
      
      expect(mockGame.update).toHaveBeenCalledWith({ currentPlayerId: 2 });
      expect(result.next_player_id).toBe(2);
    });

    it("debería retornar 'not_player_turn' cuando no es el turno del jugador", async () => {
      gameService.isPlayerTurn = jest.fn().mockResolvedValue(false);
      
      const result = await gameService.endPlayerTurn(1, 1);
      
      expect(result).toBe("not_player_turn");
    });
  });

  describe("checkGameEnd", () => {
    it("debería detectar el fin del juego cuando un jugador se queda sin cartas", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ]),
        update: jest.fn().mockResolvedValue({ status: "finished", winnerId: 1 })
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards
        .mockResolvedValueOnce([]) // Jugador 1 sin cartas
        .mockResolvedValueOnce([{ id: "blue_3" }]); // Jugador 2 con cartas
      
      const result = await gameService.checkGameEnd(gameId);
      
      expect(mockGame.update).toHaveBeenCalledWith({ status: "finished", winnerId: 1 });
      expect(result.game_ended).toBe(true);
      expect(result.winner.id).toBe(1);
    });

    it("debería retornar que el juego no ha terminado cuando todos tienen cartas", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards
        .mockResolvedValueOnce([{ id: "red_5" }])
        .mockResolvedValueOnce([{ id: "blue_3" }]);
      
      const result = await gameService.checkGameEnd(gameId);
      
      expect(result.game_ended).toBe(false);
    });
  });

  describe("getGameStatus", () => {
    it("debería obtener el estado del juego exitosamente", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        status: "started",
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      const mockTopCard = { id: "red_5" };
      const mockCurrentPlayer = { id: 1, username: "player1" };
      
      Game.findByPk.mockResolvedValue(mockGame);
      cardService.getTopCard.mockResolvedValue(mockTopCard);
      gameService.getCurrentPlayer = jest.fn().mockResolvedValue(mockCurrentPlayer);
      
      const result = await gameService.getGameStatus(gameId);
      
      expect(result.game_id).toBe(gameId);
      expect(result.status).toBe("started");
      expect(result.players.length).toBe(2);
      expect(result.top_card).toEqual(mockTopCard);
      expect(result.current_player).toEqual(mockCurrentPlayer);
    });
  });

  describe("getPlayerCards", () => {
    it("debería obtener las cartas del jugador exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      const mockCards = [{ id: "red_5" }, { id: "blue_3" }];
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards.mockResolvedValue(mockCards);
      
      const result = await gameService.getPlayerCards(gameId, userId);
      
      expect(result).toEqual(mockCards);
    });

    it("debería retornar 'player_not_in_game' cuando el jugador no está en el juego", async () => {
      const gameId = 1;
      const userId = 3;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.getPlayerCards(gameId, userId);
      
      expect(result).toBe("player_not_in_game");
    });
  });

  describe("getPlayerScores", () => {
    it("debería calcular los puntajes de los jugadores exitosamente", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      
      Game.findByPk.mockResolvedValue(mockGame);
      playerCardService.getPlayerCards
        .mockResolvedValueOnce([{ id: "red_5" }, { id: "blue_3" }])
        .mockResolvedValueOnce([{ id: "green_7" }]);
      
      gameService.getCardValue = jest.fn()
        .mockReturnValueOnce(5)  // red_5
        .mockReturnValueOnce(3)  // blue_3
        .mockReturnValueOnce(7); // green_7
      
      const result = await gameService.getPlayerScores(gameId);
      
      expect(result[1].score).toBe(8); // 5 + 3
      expect(result[1].cards_count).toBe(2);
      expect(result[2].score).toBe(7); // 7
      expect(result[2].cards_count).toBe(1);
    });
  });

  describe("playSkipCard", () => {
    it("debería jugar una carta Skip exitosamente", async () => {
      const cardPlayed = "blue_skip";
      const currentPlayerIndex = 0;
      const players = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" },
        { id: 3, username: "player3" }
      ];
      const direction = "clockwise";
      
      const result = await gameService.playSkipCard(cardPlayed, currentPlayerIndex, players, direction);
      
      expect(result.skip_successful).toBe(true);
      expect(result.skipped_player.id).toBe(2);
      expect(result.next_player.id).toBe(3);
    });

    it("debería lanzar error cuando la carta no es Skip", async () => {
      const cardPlayed = "blue_5";
      const currentPlayerIndex = 0;
      const players = [{ id: 1, username: "player1" }];
      const direction = "clockwise";
      
      await expect(gameService.playSkipCard(cardPlayed, currentPlayerIndex, players, direction))
        .rejects.toThrow("No es una carta de salto válida");
    });

    it("debería lanzar error cuando no hay jugadores", async () => {
      const cardPlayed = "blue_skip";
      const currentPlayerIndex = 0;
      const players = [];
      const direction = "clockwise";
      
      await expect(gameService.playSkipCard(cardPlayed, currentPlayerIndex, players, direction))
        .rejects.toThrow("No hay jugadores disponibles");
    });
  });

  describe("playReverseCard", () => {
    it("debería jugar una carta Reverse exitosamente", async () => {
      const cardPlayed = "green_reverse";
      const currentPlayerIndex = 0;
      const players = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" },
        { id: 3, username: "player3" }
      ];
      const direction = "clockwise";
      
      const result = await gameService.playReverseCard(cardPlayed, currentPlayerIndex, players, direction);
      
      expect(result.reverse_successful).toBe(true);
      expect(result.new_direction).toBe("counterclockwise");
      expect(result.next_player.id).toBe(3);
    });

    it("debería lanzar error cuando la carta no es Reverse", async () => {
      const cardPlayed = "green_5";
      const currentPlayerIndex = 0;
      const players = [{ id: 1, username: "player1" }];
      const direction = "clockwise";
      
      await expect(gameService.playReverseCard(cardPlayed, currentPlayerIndex, players, direction))
        .rejects.toThrow("No es una carta de reversa válida");
    });

    it("debería lanzar error cuando no hay jugadores", async () => {
      const cardPlayed = "green_reverse";
      const currentPlayerIndex = 0;
      const players = [];
      const direction = "clockwise";
      
      await expect(gameService.playReverseCard(cardPlayed, currentPlayerIndex, players, direction))
        .rejects.toThrow("No hay jugadores disponibles");
    });

    it("debería manejar correctamente la dirección contraria", async () => {
      const cardPlayed = "green_reverse";
      const currentPlayerIndex = 0;
      const players = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" },
        { id: 3, username: "player3" }
      ];
      const direction = "counterclockwise";
      
      const result = await gameService.playReverseCard(cardPlayed, currentPlayerIndex, players, direction);
      
      expect(result.reverse_successful).toBe(true);
      expect(result.new_direction).toBe("clockwise");
      expect(result.next_player.id).toBe(2);
    });

    it("debería manejar correctamente la dirección contraria cuando el jugador actual es el primero", async () => {
      const cardPlayed = "green_reverse";
      const currentPlayerIndex = 0;
      const players = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" },
        { id: 3, username: "player3" }
      ];
      const direction = "clockwise";
      
      const result = await gameService.playReverseCard(cardPlayed, currentPlayerIndex, players, direction);
      
      expect(result.reverse_successful).toBe(true);
      expect(result.new_direction).toBe("counterclockwise");
      expect(result.next_player.id).toBe(3);
    });
  });

  describe("drawUntilPlayable", () => {
    it("debería robar cartas hasta encontrar una jugable", async () => {
      const playerHand = ["red_5", "blue_3"];
      const deck = ["green_7", "yellow_2", "red_skip"];
      const currentCard = "blue_5";
      
      const result = await gameService.drawUntilPlayable(playerHand, deck, currentCard);
      
      expect(result.success).toBe(true);
      expect(result.drawn_cards.length).toBe(3);
      expect(result.playable_card).toBe("red_skip");
    });

    it("debería retornar sin éxito cuando no encuentra carta jugable", async () => {
      const playerHand = ["red_5", "blue_3"];
      const deck = ["green_7", "yellow_2"];
      const currentCard = "blue_5";
      
      const result = await gameService.drawUntilPlayable(playerHand, deck, currentCard);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe("deck_empty");
    });

    it("debería lanzar error cuando el mazo está vacío", async () => {
      const playerHand = ["red_5"];
      const deck = [];
      const currentCard = "blue_5";
      
      await expect(gameService.drawUntilPlayable(playerHand, deck, currentCard))
        .rejects.toThrow("Mazo de cartas vacío o inválido");
    });

    it("debería manejar el caso cuando el mazo se vacía", async () => {
      const playerHand = ["red_5", "blue_3"];
      const deck = ["green_7", "yellow_2"];
      const currentCard = "blue_5";
      
      const result = await gameService.drawUntilPlayable(playerHand, deck, currentCard);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe("deck_empty");
      expect(result.initial_hand_size).toBe(2);
      expect(result.final_hand_size).toBe(4);
      expect(result.cards_drawn).toBe(2);
    });

    it("debería manejar el caso cuando se alcanza el máximo de intentos", async () => {
      const playerHand = ["red_5", "blue_3"];
      const deck = Array(15).fill("green_7"); // Más de 10 cartas
      const currentCard = "blue_5";
      
      const result = await gameService.drawUntilPlayable(playerHand, deck, currentCard);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe("max_attempts_reached");
      expect(result.attempts).toBe(11);
    });
  });

  describe("isPlayerTurn", () => {
    it("debería retornar true cuando es el turno del jugador", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = { id: 1, currentPlayerId: 1 };
      
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.isPlayerTurn(gameId, userId);
      
      expect(result).toBe(true);
    });

    it("debería retornar false cuando no es el turno del jugador", async () => {
      const gameId = 1;
      const userId = 2;
      const mockGame = { id: 1, currentPlayerId: 1 };
      
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.isPlayerTurn(gameId, userId);
      
      expect(result).toBe(false);
    });
  });

  describe("validateCardPlay", () => {
    it("debería validar una carta jugable por color", async () => {
      const gameId = 1;
      const cardId = "red_5";
      const color = "red";
      
      cardService.getTopCard.mockResolvedValue("blue_5");
      
      const result = await gameService.validateCardPlay(gameId, cardId, color);
      
      expect(result).toBe(true);
    });

    it("debería validar una carta jugable por valor", async () => {
      const gameId = 1;
      const cardId = "red_5";
      const color = "red";
      
      cardService.getTopCard.mockResolvedValue("blue_5");
      
      const result = await gameService.validateCardPlay(gameId, cardId, color);
      
      expect(result).toBe(true);
    });

    it("debería invalidar una carta no jugable", async () => {
      const gameId = 1;
      const cardId = "red_5";
      const color = "red";
      
      cardService.getTopCard.mockResolvedValue("blue_7");
      
      const result = await gameService.validateCardPlay(gameId, cardId, color);
      
      expect(result).toBe(false);
    });
  });

  describe("getCurrentPlayerIndex", () => {
    it("debería obtener el índice del jugador actual", async () => {
      const gameId = 1;
      const userId = 2;
      const mockPlayers = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" },
        { id: 3, username: "player3" }
      ];
      
      gameService.getPlayersInGame = jest.fn().mockResolvedValue(mockPlayers);
      
      const result = await gameService.getCurrentPlayerIndex(gameId, userId);
      
      expect(result).toBe(1);
    });

    it("debería retornar -1 cuando el jugador no está en el juego", async () => {
      const gameId = 1;
      const userId = 4;
      const mockPlayers = [
        { id: 1, username: "player1" },
        { id: 2, username: "player2" }
      ];
      
      gameService.getPlayersInGame = jest.fn().mockResolvedValue(mockPlayers);
      
      const result = await gameService.getCurrentPlayerIndex(gameId, userId);
      
      expect(result).toBe(-1);
    });
  });

  describe("getPlayersInGame", () => {
    it("debería retornar array vacío cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.getPlayersInGame(gameId);
      
      expect(result).toEqual([]);
    });
  });

  describe("finishGame", () => {
    it("debería finalizar un juego exitosamente", async () => {
      const gameId = 1;
      const mockGame = {
        id: 1,
        update: jest.fn().mockResolvedValue({ status: "finished" })
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.finishGame(gameId);
      
      expect(mockGame.update).toHaveBeenCalledWith({ status: "finished" });
      expect(result.status).toBe("finished");
    });

    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.finishGame(gameId);
      
      expect(result).toBeNull();
    });
  });

  describe("endGame", () => {
    it("debería finalizar un juego exitosamente", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        update: jest.fn().mockResolvedValue({ status: "finished" })
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.endGame(gameId, userId);
      
      expect(mockGame.update).toHaveBeenCalledWith({ status: "finished" });
      expect(result.status).toBe("finished");
    });

    it("debería retornar 'not_creator' cuando el usuario no es el creador", async () => {
      const gameId = 1;
      const userId = 2;
      const mockGame = {
        id: 1,
        creatorId: 1
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.endGame(gameId, userId);
      
      expect(result).toBe("not_creator");
    });
  });

  describe("dealCardsToPlayers", () => {
    it("debería repartir cartas a todos los jugadores", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: "started",
        getPlayers: jest.fn().mockResolvedValue([
          { id: 1, username: "player1" },
          { id: 2, username: "player2" }
        ])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      cardService.dealCardToPlayer.mockResolvedValue(true);
      
      const result = await gameService.dealCardsToPlayers(gameId, userId);
      
      expect(cardService.dealCardToPlayer).toHaveBeenCalledTimes(14); // 2 jugadores * 7 cartas
      expect(result.dealt).toBe(true);
      expect(result.players).toBe(2);
      expect(result.cardsPerPlayer).toBe(7);
    });

    it("debería retornar 'not_creator' cuando el usuario no es el creador", async () => {
      const gameId = 1;
      const userId = 2;
      const mockGame = {
        id: 1,
        creatorId: 1
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.dealCardsToPlayers(gameId, userId);
      
      expect(result).toBe("not_creator");
    });

    it("debería retornar 'game_not_started' cuando el juego no ha iniciado", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: "waiting"
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.dealCardsToPlayers(gameId, userId);
      
      expect(result).toBe("game_not_started");
    });

    it("debería retornar 'no_players' cuando no hay jugadores", async () => {
      const gameId = 1;
      const userId = 1;
      const mockGame = {
        id: 1,
        creatorId: 1,
        status: "started",
        getPlayers: jest.fn().mockResolvedValue([])
      };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.dealCardsToPlayers(gameId, userId);
      
      expect(result).toBe("no_players");
    });
  });

  describe("getMoveHistory", () => {
    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.getMoveHistory(gameId);
      
      expect(result).toBeNull();
    });
  });

  describe("handleMultiplayer", () => {
    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.handleMultiplayer(gameId, 1, "add_player");
      
      expect(result).toBeNull();
    });

    it("debería retornar 'invalid_action' para acciones no válidas", async () => {
      const gameId = 1;
      const mockGame = { id: 1 };
      Game.findByPk.mockResolvedValue(mockGame);
      
      const result = await gameService.handleMultiplayer(gameId, 1, "invalid_action");
      
      expect(result).toBe("invalid_action");
    });
  });

  describe("logGameError", () => {
    it("debería retornar null cuando el juego no existe", async () => {
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);
      
      const result = await gameService.logGameError(gameId, 1, "error", "context");
      
      expect(result).toBeNull();
    });
  });
});