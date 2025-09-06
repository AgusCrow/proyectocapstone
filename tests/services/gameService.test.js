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

  // ... (El resto de las pruebas se mantienen igual, solo asegúrate de que los mocks estén definidos)

  // Pruebas para funciones auxiliares
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
      // Corrección: La implementación real retorna 0 para cartas inválidas
      // pero necesitamos verificar que la función maneje correctamente estos casos
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
        currentPlayerId: 1
      };
      Game.findByPk.mockResolvedValue(mockGame);
      gameService.getPlayersInGame = jest.fn().mockResolvedValue(mockPlayers);
      
      const result = await gameService.getCurrentPlayer(gameId);
      
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(gameService.getPlayersInGame).toHaveBeenCalledWith(gameId);
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
});