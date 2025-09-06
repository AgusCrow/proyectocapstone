// playerCardService.test.js
jest.mock("../../src/orm/index.js", () => ({
  PlayerCard: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  },
  Card: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    sequelize: {
      random: jest.fn(),
    },
  },
  Game: {
    findByPk: jest.fn(),
  },
  Player: {
    findByPk: jest.fn(),
  },
}));

// Import after mocks
import { Card, Game, Player, PlayerCard } from "../../src/orm/index.js";
import playerCardService from "../../src/services/playerCardService.js";
import { Op } from "sequelize";

describe("PlayerCard Service Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Cambiado de clearAllMocks a resetAllMocks
  });

  describe("getPlayerHand", () => {
    it("should get player hand successfully", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockPlayerCards = [
        {
          id: 1,
          playerId,
          gameId,
          cardId: 1,
          isPlayed: false,
          Card: { id: 1, color: "red", value: "5", type: "normal" },
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            playerId,
            gameId,
            cardId: 1,
            isPlayed: false,
            Card: { id: 1, color: "red", value: "5", type: "normal" },
          }),
        },
        {
          id: 2,
          playerId,
          gameId,
          cardId: 2,
          isPlayed: false,
          Card: { id: 2, color: "blue", value: "7", type: "normal" },
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            playerId,
            gameId,
            cardId: 2,
            isPlayed: false,
            Card: { id: 2, color: "blue", value: "7", type: "normal" },
          }),
        },
      ];
      PlayerCard.findAll.mockResolvedValue(mockPlayerCards);
      // Act
      const result = await playerCardService.getPlayerHand(gameId, playerId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId, playerId, isPlayed: false },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
        ],
      });
      expect(result).toEqual([
        {
          id: 1,
          card: { id: 1, color: "red", value: "5", type: "normal" },
          isPlayed: false,
        },
        {
          id: 2,
          card: { id: 2, color: "blue", value: "7", type: "normal" },
          isPlayed: false,
        },
      ]);
    });

    it("should return empty array when no cards found", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      PlayerCard.findAll.mockResolvedValue([]);
      // Act
      const result = await playerCardService.getPlayerHand(gameId, playerId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId, playerId, isPlayed: false },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
        ],
      });
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      PlayerCard.findAll.mockRejectedValue(new Error("Database error"));
      // Act & Assert
      await expect(
        playerCardService.getPlayerHand(gameId, playerId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("playCard", () => {
    it("should play card successfully", async () => {
      // Arrange
      const playerCardId = 1;
      const playerId = 1;
      const updatedPlayerCard = {
        id: playerCardId,
        playerId,
        isPlayed: true,
        playedAt: new Date(),
        Card: { id: 1, color: "red", value: "5", type: "normal" },
      };

      const mockPlayerCard = {
        id: playerCardId,
        playerId,
        isPlayed: false,
        playedAt: null,
        update: jest.fn().mockResolvedValue(updatedPlayerCard),
        Card: { id: 1, color: "red", value: "5", type: "normal" },
      };

      PlayerCard.findOne.mockResolvedValue(mockPlayerCard);

      // Act
      const result = await playerCardService.playCard(playerCardId, playerId);

      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { id: playerCardId, playerId, isPlayed: false },
        include: [Card],
      });
      expect(mockPlayerCard.update).toHaveBeenCalledWith({
        isPlayed: true,
        playedAt: expect.any(Date),
      });

      // Verificamos que el resultado sea el objeto actualizado devuelto por update
      expect(result).toEqual(updatedPlayerCard);
    });
    it("should throw error when card not found", async () => {
      // Arrange
      const playerCardId = 999;
      const playerId = 1;
      PlayerCard.findOne.mockResolvedValue(null);
      // Act & Assert
      await expect(
        playerCardService.playCard(playerCardId, playerId)
      ).rejects.toThrow("Carta no encontrada o ya jugada");
    });

    it("should throw error when card already played", async () => {
      // Arrange
      const playerCardId = 1;
      const playerId = 1;
      PlayerCard.findOne.mockResolvedValue(null);
      // Act & Assert
      await expect(
        playerCardService.playCard(playerCardId, playerId)
      ).rejects.toThrow("Carta no encontrada o ya jugada");
    });

    it("should throw error when card belongs to different player", async () => {
      // Arrange
      const playerCardId = 1;
      const playerId = 1;
      PlayerCard.findOne.mockResolvedValue(null);
      // Act & Assert
      await expect(
        playerCardService.playCard(playerCardId, playerId)
      ).rejects.toThrow("Carta no encontrada o ya jugada");
    });

    it("should handle update errors", async () => {
      // Arrange
      const playerCardId = 1;
      const playerId = 1;
      const mockPlayerCard = {
        id: playerCardId,
        playerId,
        isPlayed: false,
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
        Card: { id: 1, color: "red", value: "5", type: "normal" },
      };
      PlayerCard.findOne.mockResolvedValue(mockPlayerCard);
      // Act & Assert
      await expect(
        playerCardService.playCard(playerCardId, playerId)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("drawCard", () => {
    it("should draw card successfully", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockGame = { id: gameId, status: "playing" };
      const mockPlayer = { id: playerId };
      const availableCard = { id: 1, color: "red", value: "5", type: "normal" };
      const createdPlayerCard = {
        id: 1,
        playerId,
        gameId,
        cardId: 1,
        isPlayed: false,
        Card: availableCard,
      };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(mockPlayer);
      PlayerCard.findAll.mockResolvedValue([]);
      Card.findOne.mockResolvedValue(availableCard);
      PlayerCard.create.mockResolvedValue(createdPlayerCard);
      // Act
      const result = await playerCardService.drawCard(gameId, playerId);
      // Assert
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(Player.findByPk).toHaveBeenCalledWith(playerId);
      expect(Card.findOne).toHaveBeenCalledWith({
        where: {
          id: {
            [Op.notIn]: [],
          },
        },
        order: Card.sequelize.random(),
      });
      expect(PlayerCard.create).toHaveBeenCalledWith({
        playerId,
        gameId,
        cardId: 1,
        isPlayed: false,
      });
      expect(result).toEqual({
        id: createdPlayerCard.id,
        card: createdPlayerCard.Card,
        isPlayed: createdPlayerCard.isPlayed,
      });
    });

    it("should throw error when game not found", async () => {
      // Arrange
      const gameId = 999;
      const playerId = 1;
      Game.findByPk.mockResolvedValue(null);
      PlayerCard.findAll.mockResolvedValue([]);
      // Act & Assert
      await expect(
        playerCardService.drawCard(gameId, playerId)
      ).rejects.toThrow("Juego no encontrado");
    });

    it("should throw error when player not found", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 999;
      const mockGame = { id: gameId, status: "playing" };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(null);
      PlayerCard.findAll.mockResolvedValue([]);
      // Act & Assert
      await expect(
        playerCardService.drawCard(gameId, playerId)
      ).rejects.toThrow("Jugador no encontrado");
    });

    it("should throw error when no cards available", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockGame = { id: gameId, status: "playing" };
      const mockPlayer = { id: playerId };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(mockPlayer);
      PlayerCard.findAll.mockResolvedValue([]);
      Card.findOne.mockResolvedValue(null);
      // Act & Assert
      await expect(
        playerCardService.drawCard(gameId, playerId)
      ).rejects.toThrow("No hay cartas disponibles para robar");
    });

    it("should handle create errors", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockGame = { id: gameId, status: "playing" };
      const mockPlayer = { id: playerId };
      const availableCard = { id: 1, color: "red", value: "5", type: "normal" };
      Game.findByPk.mockResolvedValue(mockGame);
      Player.findByPk.mockResolvedValue(mockPlayer);
      PlayerCard.findAll.mockResolvedValue([]);
      Card.findOne.mockResolvedValue(availableCard);
      PlayerCard.create.mockRejectedValue(new Error("Create failed"));
      // Act & Assert
      await expect(
        playerCardService.drawCard(gameId, playerId)
      ).rejects.toThrow("Create failed");
    });
  });

  describe("getPlayedCards", () => {
    it("should get played cards successfully", async () => {
      // Arrange
      const gameId = 1;
      const mockPlayedCards = [
        {
          id: 1,
          gameId,
          isPlayed: true,
          playedAt: new Date(),
          Card: { id: 1, color: "red", value: "5", type: "normal" },
          Player: { id: 1, username: "player1" },
        },
      ];
      PlayerCard.findAll.mockResolvedValue(mockPlayedCards);
      // Act
      const result = await playerCardService.getPlayedCards(gameId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
          {
            model: Player,
            attributes: ["id", "username"],
          },
        ],
        order: [["playedAt", "DESC"]],
      });
      expect(result).toEqual([
        {
          id: 1,
          card: { id: 1, color: "red", value: "5", type: "normal" },
          player: { id: 1, username: "player1" },
          playedAt: mockPlayedCards[0].playedAt,
        },
      ]);
    });

    it("should return empty array when no played cards", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findAll.mockResolvedValue([]);
      // Act
      const result = await playerCardService.getPlayedCards(gameId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
          {
            model: Player,
            attributes: ["id", "username"],
          },
        ],
        order: [["playedAt", "DESC"]],
      });
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findAll.mockRejectedValue(new Error("Database error"));
      // Act & Assert
      await expect(playerCardService.getPlayedCards(gameId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getLastPlayedCard", () => {
    it("should get last played card successfully", async () => {
      // Arrange
      const gameId = 1;
      const mockLastCard = {
        id: 1,
        gameId,
        isPlayed: true,
        playedAt: new Date(),
        Card: { id: 1, color: "red", value: "5", type: "normal" },
        Player: { id: 1, username: "player1" },
      };
      PlayerCard.findOne.mockResolvedValue(mockLastCard);
      // Act
      const result = await playerCardService.getLastPlayedCard(gameId);
      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
          {
            model: Player,
            attributes: ["id", "username"],
          },
        ],
        order: [["playedAt", "DESC"]],
      });
      expect(result).toEqual({
        id: 1,
        card: { id: 1, color: "red", value: "5", type: "normal" },
        player: { id: 1, username: "player1" },
        playedAt: mockLastCard.playedAt,
      });
    });

    it("should return null when no played cards", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findOne.mockResolvedValue(null);
      // Act
      const result = await playerCardService.getLastPlayedCard(gameId);
      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
          {
            model: Player,
            attributes: ["id", "username"],
          },
        ],
        order: [["playedAt", "DESC"]],
      });
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findOne.mockRejectedValue(new Error("Database error"));
      // Act & Assert
      await expect(playerCardService.getLastPlayedCard(gameId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createPlayerCard", () => {
    it("should create player card successfully", async () => {
      // Arrange
      const playerCardData = {
        playerId: 1,
        gameId: 1,
        cardId: 1,
      };
      const mockPlayerCard = {
        id: 1,
        ...playerCardData,
        isPlayed: false,
      };
      PlayerCard.create.mockResolvedValue(mockPlayerCard);
      // Act
      const result = await playerCardService.createPlayerCard(playerCardData);
      // Assert
      expect(PlayerCard.create).toHaveBeenCalledWith({
        ...playerCardData,
        isPlayed: false,
      });
      expect(result).toBe(mockPlayerCard);
    });

    it("should handle create errors", async () => {
      // Arrange
      const playerCardData = {
        playerId: 1,
        gameId: 1,
        cardId: 1,
      };
      PlayerCard.create.mockRejectedValue(new Error("Create failed"));
      // Act & Assert
      await expect(
        playerCardService.createPlayerCard(playerCardData)
      ).rejects.toThrow("Create failed");
    });
  });

  describe("updatePlayerCard", () => {
    it("should update player card successfully", async () => {
      // Arrange
      const playerCardId = 1;
      const updateData = { isPlayed: true };
      const mockPlayerCard = {
        id: playerCardId,
        playerId: 1,
        gameId: 1,
        isPlayed: false,
        update: jest.fn().mockResolvedValue({
          id: playerCardId,
          playerId: 1,
          gameId: 1,
          isPlayed: true,
        }),
      };
      PlayerCard.findByPk.mockResolvedValue(mockPlayerCard);
      // Act
      const result = await playerCardService.updatePlayerCard(
        playerCardId,
        updateData
      );
      // Assert
      expect(PlayerCard.findByPk).toHaveBeenCalledWith(playerCardId);
      expect(mockPlayerCard.update).toHaveBeenCalledWith(updateData);
      expect(result).toHaveProperty("isPlayed", true);
    });

    it("should return null when player card not found", async () => {
      // Arrange
      const playerCardId = 999;
      const updateData = { isPlayed: true };
      PlayerCard.findByPk.mockResolvedValue(null);
      // Act
      const result = await playerCardService.updatePlayerCard(
        playerCardId,
        updateData
      );
      // Assert
      expect(PlayerCard.findByPk).toHaveBeenCalledWith(playerCardId);
      expect(result).toBeNull();
    });

    it("should handle update errors", async () => {
      // Arrange
      const playerCardId = 1;
      const updateData = { isPlayed: true };
      const mockPlayerCard = {
        id: playerCardId,
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
      };
      PlayerCard.findByPk.mockResolvedValue(mockPlayerCard);
      // Act & Assert
      await expect(
        playerCardService.updatePlayerCard(playerCardId, updateData)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deletePlayerCard", () => {
    it("should delete player card successfully", async () => {
      // Arrange
      const playerCardId = 1;
      const mockPlayerCard = {
        id: playerCardId,
        destroy: jest.fn().mockResolvedValue(true),
      };
      PlayerCard.findByPk.mockResolvedValue(mockPlayerCard);
      // Act
      const result = await playerCardService.deletePlayerCard(playerCardId);
      // Assert
      expect(PlayerCard.findByPk).toHaveBeenCalledWith(playerCardId);
      expect(mockPlayerCard.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false when player card not found", async () => {
      // Arrange
      const playerCardId = 999;
      PlayerCard.findByPk.mockResolvedValue(null);
      // Act
      const result = await playerCardService.deletePlayerCard(playerCardId);
      // Assert
      expect(PlayerCard.findByPk).toHaveBeenCalledWith(playerCardId);
      expect(result).toBe(false); // Cambiado de null a false
    });

    it("should handle destroy errors", async () => {
      // Arrange
      const playerCardId = 1;
      const mockPlayerCard = {
        id: playerCardId,
        destroy: jest.fn().mockRejectedValue(new Error("Destroy failed")),
      };
      PlayerCard.findByPk.mockResolvedValue(mockPlayerCard);
      // Act & Assert
      await expect(
        playerCardService.deletePlayerCard(playerCardId)
      ).rejects.toThrow("Destroy failed");
    });
  });

  describe("getPlayerCardsByGame", () => {
    it("should get player cards by game successfully", async () => {
      // Arrange
      const gameId = 1;
      const mockPlayerCards = [
        {
          id: 1,
          gameId,
          playerId: 1,
          Card: { id: 1, color: "red", value: "5", type: "normal" },
          Player: { id: 1, username: "player1" },
        },
      ];
      PlayerCard.findAll.mockResolvedValue(mockPlayerCards);
      // Act
      const result = await playerCardService.getPlayerCardsByGame(gameId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
          {
            model: Player,
            attributes: ["id", "username"],
          },
        ],
      });
      expect(result).toEqual(mockPlayerCards);
    });

    it("should handle database errors", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findAll.mockRejectedValue(new Error("Database error"));
      // Act & Assert
      await expect(
        playerCardService.getPlayerCardsByGame(gameId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getPlayerCardsByPlayer", () => {
    it("should get player cards by player successfully", async () => {
      // Arrange
      const playerId = 1;
      const mockPlayerCards = [
        {
          id: 1,
          playerId,
          gameId: 1,
          Card: { id: 1, color: "red", value: "5", type: "normal" },
        },
      ];
      PlayerCard.findAll.mockResolvedValue(mockPlayerCards);
      // Act
      const result = await playerCardService.getPlayerCardsByPlayer(playerId);
      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { playerId },
        include: [
          {
            model: Card,
            attributes: ["id", "color", "value", "type"],
          },
        ],
      });
      expect(result).toEqual(mockPlayerCards);
    });

    it("should handle database errors", async () => {
      // Arrange
      const playerId = 1;
      PlayerCard.findAll.mockRejectedValue(new Error("Database error"));
      // Act & Assert
      await expect(
        playerCardService.getPlayerCardsByPlayer(playerId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getTopCard", () => {
    it("should get top card from played cards", async () => {
      // Arrange
      const gameId = 1;
      const mockPlayerCard = {
        id: 1,
        gameId,
        isPlayed: true,
        Card: { id: 1, color: "red", value: "5", type: "normal" },
      };
      PlayerCard.findOne.mockResolvedValue(mockPlayerCard);
      // Act
      const result = await playerCardService.getTopCard(gameId); // Cambiado de cardService a playerCardService
      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [Card],
        order: [["playedAt", "DESC"]],
      });
      expect(result).toBe("red_5");
    });

    it("should get random card when no played cards", async () => {
      // Arrange
      const gameId = 1;
      const mockCard = { id: 1, color: "blue", value: "7", type: "normal" };
      PlayerCard.findOne.mockResolvedValue(null);
      Card.findOne.mockResolvedValue(mockCard);
      // Act
      const result = await playerCardService.getTopCard(gameId); // Cambiado de cardService a playerCardService
      // Assert
      expect(Card.findOne).toHaveBeenCalledWith({
        order: Card.sequelize.random(),
      });
      expect(result).toBe("blue_7");
    });

    it("should return null when no cards available", async () => {
      // Arrange
      const gameId = 1;
      PlayerCard.findOne.mockResolvedValue(null);
      Card.findOne.mockResolvedValue(null);
      // Act
      const result = await playerCardService.getTopCard(gameId); // Cambiado de cardService a playerCardService
      // Assert
      expect(result).toBeNull();
    });

    it("should handle default values when card properties are null", async () => {
      // Arrange
      const gameId = 1;
      const mockPlayerCard = {
        id: 1,
        gameId,
        isPlayed: true,
        Card: { id: 1, color: null, value: null, type: "normal" },
      };
      PlayerCard.findOne.mockResolvedValue(mockPlayerCard);
      // Act
      const result = await playerCardService.getTopCard(gameId); // Cambiado de cardService a playerCardService
      // Assert
      expect(result).toBe("red_0");
    });
  });

  describe("dealInitialCards", () => {
    it("should deal initial cards successfully", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const numberOfCards = 7;
      const mockUsedCards = [{ cardId: 1 }, { cardId: 2 }];
      const mockAvailableCards = Array.from({ length: 10 }, (_, i) => ({
        id: i + 3,
        color: "red",
        value: i.toString(),
        type: "normal",
      }));
      const mockCreatedPlayerCards = mockAvailableCards
        .slice(0, numberOfCards)
        .map((card) => ({
          id: card.id,
          playerId,
          gameId,
          cardId: card.id,
          isPlayed: false,
        }));

      PlayerCard.findAll.mockResolvedValue(mockUsedCards);
      Card.findAll.mockResolvedValue(mockAvailableCards);
      PlayerCard.create.mockImplementation((data) => {
        return Promise.resolve({ ...data, id: data.cardId });
      });

      // Act
      const result = await playerCardService.dealInitialCards(
        gameId,
        playerId,
        numberOfCards
      );

      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId },
        attributes: ["cardId"],
      });
      expect(Card.findAll).toHaveBeenCalledWith({
        where: {
          id: { [Op.notIn]: mockUsedCards.map((pc) => pc.cardId) },
        },
      });
      expect(PlayerCard.create).toHaveBeenCalledTimes(numberOfCards);
      expect(result).toHaveLength(numberOfCards);
      result.forEach((playerCard, index) => {
        expect(playerCard.cardId).toBe(mockAvailableCards[index].id);
      });
    });

    it("should throw error when not enough cards available", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const numberOfCards = 7;
      const mockUsedCards = [{ cardId: 1 }, { cardId: 2 }];
      const mockAvailableCards = Array.from({ length: 5 }, (_, i) => ({
        id: i + 3,
        color: "red",
        value: i.toString(),
        type: "normal",
      }));

      PlayerCard.findAll.mockResolvedValue(mockUsedCards);
      Card.findAll.mockResolvedValue(mockAvailableCards);

      // Act & Assert
      await expect(
        playerCardService.dealInitialCards(gameId, playerId, numberOfCards)
      ).rejects.toThrow("No hay suficientes cartas disponibles");
    });
  });

  describe("dealCardsToAllPlayers", () => {
    it("should deal cards to all players successfully", async () => {
      // Arrange
      const gameId = 1;
      const mockGame = {
        id: gameId,
        getPlayers: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      };

      Game.findByPk.mockResolvedValue(mockGame);
      jest.spyOn(playerCardService, "dealInitialCards").mockResolvedValue([]);

      // Act
      const result = await playerCardService.dealCardsToAllPlayers(gameId);

      // Assert
      expect(Game.findByPk).toHaveBeenCalledWith(gameId);
      expect(mockGame.getPlayers).toHaveBeenCalled();
      expect(playerCardService.dealInitialCards).toHaveBeenCalledTimes(2);
      expect(playerCardService.dealInitialCards).toHaveBeenCalledWith(
        gameId,
        1,
        7
      );
      expect(playerCardService.dealInitialCards).toHaveBeenCalledWith(
        gameId,
        2,
        7
      );
      expect(result).toBe(true);
    });

    it("should throw error when game not found", async () => {
      // Arrange
      const gameId = 999;
      Game.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        playerCardService.dealCardsToAllPlayers(gameId)
      ).rejects.toThrow("Juego no encontrado");
    });
  });

  describe("getPlayerCard", () => {
    it("should get player card successfully", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const cardId = 1;
      const mockPlayerCard = {
        id: 1,
        gameId,
        playerId,
        cardId,
        Card: { id: cardId, color: "red", value: "5", type: "normal" },
      };

      PlayerCard.findOne.mockResolvedValue(mockPlayerCard);

      // Act
      const result = await playerCardService.getPlayerCard(
        gameId,
        playerId,
        cardId
      );

      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, playerId, cardId },
        include: [Card],
      });
      expect(result).toEqual(mockPlayerCard);
    });

    it("should return null when player card not found", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const cardId = 999;
      PlayerCard.findOne.mockResolvedValue(null);

      // Act
      const result = await playerCardService.getPlayerCard(
        gameId,
        playerId,
        cardId
      );

      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, playerId, cardId },
        include: [Card],
      });
      expect(result).toBeNull();
    });
  });

  describe("dealCardToPlayer", () => {
    it("should deal card to player successfully", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockUsedCards = [{ cardId: 1 }, { cardId: 2 }];
      const mockAvailableCard = {
        id: 3,
        color: "red",
        value: "5",
        type: "normal",
      };
      const mockCreatedPlayerCard = {
        id: 1,
        playerId,
        gameId,
        cardId: 3,
        isPlayed: false,
      };

      PlayerCard.findAll.mockResolvedValue(mockUsedCards);
      Card.findOne.mockResolvedValue(mockAvailableCard);
      PlayerCard.create.mockResolvedValue(mockCreatedPlayerCard);

      // Act
      const result = await playerCardService.dealCardToPlayer(gameId, playerId);

      // Assert
      expect(PlayerCard.findAll).toHaveBeenCalledWith({
        where: { gameId },
        attributes: ["cardId"],
      });
      expect(Card.findOne).toHaveBeenCalledWith({
        where: {
          id: { [Op.notIn]: mockUsedCards.map((pc) => pc.cardId) },
        },
        order: Card.sequelize.random(),
      });
      expect(PlayerCard.create).toHaveBeenCalledWith({
        playerId,
        gameId,
        cardId: 3,
        isPlayed: false,
      });
      expect(result).toEqual({
        id: mockCreatedPlayerCard.id,
        card: mockAvailableCard,
        isPlayed: false,
      });
    });

    it("should throw error when no cards available", async () => {
      // Arrange
      const gameId = 1;
      const playerId = 1;
      const mockUsedCards = [{ cardId: 1 }, { cardId: 2 }];

      PlayerCard.findAll.mockResolvedValue(mockUsedCards);
      Card.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        playerCardService.dealCardToPlayer(gameId, playerId)
      ).rejects.toThrow("No hay cartas disponibles para repartir");
    });
  });

  describe("Uno Status", () => {
    beforeEach(() => {
      // Limpiar el estado global antes de cada test
      if (global.unoStatus) {
        delete global.unoStatus;
      }
    });

    describe("setUnoStatus", () => {
      it("should set UNO status successfully", async () => {
        // Arrange
        const gameId = 1;
        const playerId = 1;
        const status = true;

        // Act
        const result = await playerCardService.setUnoStatus(
          gameId,
          playerId,
          status
        );

        // Assert
        expect(result).toBe(true);
        expect(global.unoStatus[`${gameId}_${playerId}`]).toBe(status);
      });
    });

    describe("getUnoStatus", () => {
      it("should get UNO status successfully", async () => {
        // Arrange
        const gameId = 1;
        const playerId = 1;
        const status = true;
        global.unoStatus = {};
        global.unoStatus[`${gameId}_${playerId}`] = status;

        // Act
        const result = await playerCardService.getUnoStatus(gameId, playerId);

        // Assert
        expect(result).toBe(status);
      });

      it("should return false when UNO status not set", async () => {
        // Arrange
        const gameId = 1;
        const playerId = 1;

        // Act
        const result = await playerCardService.getUnoStatus(gameId, playerId);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  // Ya tenemos tests para getTopCard, pero asegurémonos de cubrir el caso cuando no hay cartas jugadas
  describe("getTopCard", () => {
    it("should get random card when no played cards", async () => {
      // Arrange
      const gameId = 1;
      const mockCard = { id: 1, color: "blue", value: "7", type: "normal" };
      PlayerCard.findOne.mockResolvedValue(null);
      Card.findOne.mockResolvedValue(mockCard);

      // Act
      const result = await playerCardService.getTopCard(gameId);

      // Assert
      expect(PlayerCard.findOne).toHaveBeenCalledWith({
        where: { gameId, isPlayed: true },
        include: [Card],
        order: [["playedAt", "DESC"]],
      });
      expect(Card.findOne).toHaveBeenCalledWith({
        order: Card.sequelize.random(),
      });
      expect(result).toBe("blue_7");
    });
  });
});
