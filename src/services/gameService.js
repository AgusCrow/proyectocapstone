import { Game, Player } from "../orm/index.js";
import functional from "../utils/functional.js";
import cardService from "./cardService.js";
import playerCardService from "./playerCardService.js";
const { map, identity } = functional;

// Crear un nuevo juego
const createGame = async (data) => {
  return await Game.create({
    name: data.name,
    status: "waiting",
    creatorId: data.creatorId,
  });
};

// Obtener juego por ID
const getGameById = async (id) => {
  return await Game.findByPk(id);
};

// Actualizar juego
const updateGame = async (id, data) => {
  const game = await Game.findByPk(id);
  if (!game) return null;
  return await game.update(data);
};

// Eliminar juego
const deleteGame = async (id) => {
  const game = await Game.findByPk(id);
  if (!game) return null;
  await game.destroy();
  return true;
};

// Listar todos los juegos
const listGames = async () => {
  const games = await Game.findAll();
  return map(identity)(games);
};

// Agregar jugador a un juego
const addPlayerToGame = async (gameId, playerId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null; // Verificar si el jugador ya está en el juego
    const existingPlayers = await game.getPlayers();
    const isAlreadyInGame = existingPlayers.some(
      (player) => player.id === playerId
    );
    if (isAlreadyInGame) return "already_joined"; // Obtener el jugador y agregarlo al juego
    const player = await Player.findByPk(playerId);
    if (!player) return null;
    await game.addPlayer(player);
    return true;
  } catch (error) {
    console.error("Error adding player to game:", error);
    throw error;
  }
};

// Obtener jugadores de un juego
const getPlayersInGame = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return [];
    const players = await game.getPlayers();
    return map(identity)(players);
  } catch (error) {
    console.error("Error getting players in game:", error);
    return [];
  }
};

// Iniciar juego (cambia estado si todos están listos)
const startGame = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null; // Verificar que el usuario sea el creador
    if (game.creatorId !== userId) return "not_creator"; // Verificar que haya al menos un jugador en el juego
    const players = await game.getPlayers();
    if (players.length === 0) {
      return "no_players";
    } // Inicializar el mazo de cartas antes de repartir
    await cardService.initDeck(); // Iniciar el juego

    await game.update({ status: "started" }); // Repartir cartas a todos los jugadores
    await playerCardService.dealCardsToAllPlayers(gameId);
    return game;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
};

// Finalizar juego
const finishGame = async (gameId) => {
  const game = await Game.findByPk(gameId);
  if (!game) return null;
  await game.update({ status: "finished" });
  return game;
};

const removePlayerFromGame = async (gameId, playerId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;
    const players = await game.getPlayers();
    const isInGame = players.some((p) => p.id === playerId);
    if (!isInGame) return "not_in_game";
    await game.removePlayer(playerId);
    return true;
  } catch (error) {
    console.error("Error removing player from game:", error);
    throw error;
  }
};

const endGame = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);
  if (!game) return null;
  if (game.creatorId !== userId) return "not_creator";
  await game.update({ status: "finished" });
  return game;
};

const dealCardsToPlayers = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;
    if (game.creatorId !== userId) return "not_creator";
    if (game.status !== "started") return "game_not_started";

    const players = await game.getPlayers();
    if (players.length === 0) return "no_players";

    // Función recursiva para repartir cartas
    const dealCardsRecursive = async (players, cardsPerPlayer, currentCardIndex = 0) => {
      if (currentCardIndex >= cardsPerPlayer) {
        return { dealt: true, players: players.length, cardsPerPlayer };
      }

      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        const player = players[playerIndex];
        await cardService.dealCardToPlayer(gameId, player.id);
      }

      return dealCardsRecursive(players, cardsPerPlayer, currentCardIndex + 1);
    };

    const result = await dealCardsRecursive(players, 7); // 7 cartas por jugador
    return result;
  } catch (error) {
    console.error("Error dealing cards to players:", error);
    throw error;
  }
};

// 2. Reglas para Jugar una Carta
const playCardWithRules = async (gameId, userId, cardId, color) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    // Verificar si es el turno del jugador
    if (!await isPlayerTurn(gameId, userId)) {
      return "not_player_turn";
    }

    // Verificar si el jugador tiene la carta
    const playerCard = await playerCardService.getPlayerCard(gameId, userId, cardId);
    if (!playerCard) return "card_not_found";

    // Validar reglas del juego UNO
    const isValidMove = await validateCardPlay(gameId, cardId, color);
    if (!isValidMove) return "invalid_card";

    // Jugar la carta
    await playerCardService.playCard(gameId, userId, cardId, color);

    // Obtener estado actualizado del juego
    const gameState = await getGameStatus(gameId);
    return gameState;
  } catch (error) {
    console.error("Error playing card with rules:", error);
    throw error;
  }
};

// 3. Robar Carta cuando no se puede Jugar
const drawCardForPlayer = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;
    if (game.status !== "started") return "game_not_started";

    // Verificar si es el turno del jugador
    if (!await isPlayerTurn(gameId, userId)) {
      return "not_player_turn";
    }

    // Robar carta del mazo
    const drawnCard = await cardService.drawCardFromDeck(gameId, userId);
    return drawnCard;
  } catch (error) {
    console.error("Error drawing card for player:", error);
    throw error;
  }
};

// 4. Sistema UNO y Monitoreo (función recursiva)
const sayUno = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    const player = players.find(p => p.id === userId);
    if (!player) return "player_not_found";

    // Verificar si el jugador tiene exactamente 1 carta
    const playerCards = await playerCardService.getPlayerCards(gameId, userId);
    if (playerCards.length !== 1) return "invalid_uno_state";

    // Función recursiva de monitoreo UNO
    const monitorUnoStatus = async (gameId, playerId, monitoringLevel = 0) => {
      if (monitoringLevel > 10) return { uno_declared: true, monitoring_complete: true };

      // Registrar estado UNO
      await playerCardService.setUnoStatus(gameId, playerId, true);

      // Monitorear otros jugadores
      const otherPlayers = await getPlayersInGame(gameId);
      for (const otherPlayer of otherPlayers) {
        if (otherPlayer.id !== playerId) {
          const otherPlayerCards = await playerCardService.getPlayerCards(gameId, otherPlayer.id);
          if (otherPlayerCards.length === 1 && !await playerCardService.getUnoStatus(gameId, otherPlayer.id)) {
            // Encontrar jugador que no dijo UNO
            return { uno_declared: true, potential_violation: otherPlayer.id };
          }
        }
      }

      return monitorUnoStatus(gameId, playerId, monitoringLevel + 1);
    };

    const result = await monitorUnoStatus(gameId, userId);
    return result;
  } catch (error) {
    console.error("Error saying UNO:", error);
    throw error;
  }
};

// 5. Desafío por no decir UNO
const challengeUno = async (gameId, userId, challengedPlayerId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    const challenger = players.find(p => p.id === userId);
    const challenged = players.find(p => p.id === challengedPlayerId);
    
    if (!challenger || !challenged) return "player_not_found";

    // Verificar si el jugador desafiado tiene 1 carta y no dijo UNO
    const challengedCards = await playerCardService.getPlayerCards(gameId, challengedPlayerId);
    const challengedUnoStatus = await playerCardService.getUnoStatus(gameId, challengedPlayerId);

    if (challengedCards.length === 1 && !challengedUnoStatus) {
      // Desafío exitoso: jugador desafiado debe robar 2 cartas
      await cardService.drawMultipleCards(gameId, challengedPlayerId, 2);
      return { challenge_success: true, penalty_cards: 2, challenged_player: challengedPlayerId };
    } else {
      // Desafío fallido: desafiante debe robar 2 cartas
      await cardService.drawMultipleCards(gameId, userId, 2);
      return { challenge_success: false, penalty_cards: 2, challenger: userId };
    }
  } catch (error) {
    console.error("Error challenging UNO:", error);
    throw error;
  }
};

// 6. Finalización de Turno
const endPlayerTurn = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    // Verificar si es el turno del jugador
    if (!await isPlayerTurn(gameId, userId)) {
      return "not_player_turn";
    }

    // Obtener jugadores y determinar siguiente turno
    const players = await game.getPlayers();
    const currentPlayerIndex = await getCurrentPlayerIndex(gameId, userId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];

    // Actualizar turno del juego
    await game.update({ currentPlayerId: nextPlayer.id });

    return { next_player_id: nextPlayer.id, next_player_name: nextPlayer.username };
  } catch (error) {
    console.error("Error ending player turn:", error);
    throw error;
  }
};

// 7. Detección de Fin de Juego
const checkGameEnd = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    let gameEnded = false;
    let winner = null;
    let scores = {};

    // Verificar si algún jugador se quedó sin cartas
    for (const player of players) {
      const playerCards = await playerCardService.getPlayerCards(gameId, player.id);
      if (playerCards.length === 0) {
        gameEnded = true;
        winner = player;
        break;
      }
    }

    if (gameEnded) {
      // Calcular puntajes
      for (const player of players) {
        const playerCards = await playerCardService.getPlayerCards(gameId, player.id);
        let playerScore = 0;
        
        for (const card of playerCards) {
          playerScore += getCardValue(card);
        }
        
        scores[player.id] = playerScore;
      }

      // Finalizar juego
      await game.update({ status: "finished", winnerId: winner.id });

      return {
        game_ended: true,
        winner: { id: winner.id, username: winner.username },
        scores: scores
      };
    }

    return { game_ended: false };
  } catch (error) {
    console.error("Error checking game end:", error);
    throw error;
  }
};

// 8. Consulta de Estado del Juego
const getGameStatus = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    const topCard = await cardService.getTopCard(gameId);
    const currentPlayer = await getCurrentPlayer(gameId);

    return {
      game_id: gameId,
      status: game.status,
      players: players.map(p => ({ id: p.id, username: p.username })),
      top_card: topCard,
      current_player: currentPlayer,
      created_at: game.createdAt,
      updated_at: game.updatedAt
    };
  } catch (error) {
    console.error("Error getting game status:", error);
    throw error;
  }
};

// 9. Historial de Movimientos
const getMoveHistory = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    // Simulación: obtener historial de movimientos
    const moves = [
      { player: "Player1", action: "drew_card", timestamp: new Date() },
      { player: "Player2", action: "played_card", card: "Red 5", timestamp: new Date() },
      { player: "Player1", action: "said_uno", timestamp: new Date() }
    ];

    return moves;
  } catch (error) {
    console.error("Error getting move history:", error);
    throw error;
  }
};

// 10. Visualización de Cartas Propias
const getPlayerCards = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    const player = players.find(p => p.id === userId);
    if (!player) return "player_not_in_game";

    const playerCards = await playerCardService.getPlayerCards(gameId, userId);
    return playerCards;
  } catch (error) {
    console.error("Error getting player cards:", error);
    throw error;
  }
};

// 11. Puntajes de Jugadores
const getPlayerScores = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const players = await game.getPlayers();
    const scores = {};

    for (const player of players) {
      const playerCards = await playerCardService.getPlayerCards(gameId, player.id);
      let score = 0;
      
      for (const card of playerCards) {
        score += getCardValue(card);
      }
      
      scores[player.id] = {
        username: player.username,
        score: score,
        cards_count: playerCards.length
      };
    }

    return scores;
  } catch (error) {
    console.error("Error getting player scores:", error);
    throw error;
  }
};

// 12. Soporte Multijugador
const handleMultiplayer = async (gameId, userId, action) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    const validActions = ['add_player', 'remove_player', 'change_settings'];
    if (!validActions.includes(action)) return "invalid_action";

    switch (action) {
      case 'add_player':
        // Lógica para añadir jugador
        return { action: 'add_player', status: 'success' };
      case 'remove_player':
        // Lógica para remover jugador
        return { action: 'remove_player', status: 'success' };
      case 'change_settings':
        // Lógica para cambiar configuración
        return { action: 'change_settings', status: 'success' };
      default:
        return "invalid_action";
    }
  } catch (error) {
    console.error("Error handling multiplayer:", error);
    throw error;
  }
};

// 13. Registro de Errores
const logGameError = async (gameId, userId, error, context) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;

    // Simulación: registrar error en log
    const errorLog = {
      game_id: gameId,
      user_id: userId,
      error: error,
      context: context,
      timestamp: new Date(),
      log_id: Math.random().toString(36).substr(2, 9)
    };

    console.log('Game Error Logged:', errorLog);
    return errorLog.log_id;
  } catch (error) {
    console.error("Error logging game error:", error);
    throw error;
  }
};

// Week7 - Funcionalidades Avanzadas

// 1. Jugar carta de salto (Skip)
const playSkipCard = async (cardPlayed, currentPlayerIndex, players, direction) => {
  try {
    // Validar que sea una carta de salto
    if (!cardPlayed || !cardPlayed.toLowerCase().includes('skip')) {
      throw new Error("No es una carta de salto válida");
    }

    // Validar jugadores y dirección
    if (!players || players.length === 0) {
      throw new Error("No hay jugadores disponibles");
    }

    // Calcular el siguiente jugador (el que será saltado)
    const skippedPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const skippedPlayer = players[skippedPlayerIndex];

    // Calcular el jugador después del saltado (el que realmente jugará)
    const nextPlayerIndex = (skippedPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];

    return {
      skip_successful: true,
      skipped_player: skippedPlayer,
      next_player: nextPlayer,
      players_affected: [skippedPlayer]
    };
  } catch (error) {
    console.error("Error playing skip card:", error);
    throw error;
  }
};

// 2. Jugar carta de reversa (Reverse)
const playReverseCard = async (cardPlayed, currentPlayerIndex, players, direction) => {
  try {
    // Validar que sea una carta de reversa
    if (!cardPlayed || !cardPlayed.toLowerCase().includes('reverse')) {
      throw new Error("No es una carta de reversa válida");
    }

    // Validar jugadores y dirección
    if (!players || players.length === 0) {
      throw new Error("No hay jugadores disponibles");
    }

    // Invertir dirección usando procesamiento de tubería
    const newDirection = direction === 'clockwise' ? 'counterclockwise' : 'clockwise';

    // Calcular siguiente jugador basado en la nueva dirección
    let nextPlayerIndex;
    if (newDirection === 'clockwise') {
      nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } else {
      nextPlayerIndex = currentPlayerIndex === 0 ? players.length - 1 : currentPlayerIndex - 1;
    }

    const nextPlayer = players[nextPlayerIndex];

    return {
      reverse_successful: true,
      new_direction: newDirection,
      next_player: nextPlayer,
      direction_changed: true
    };
  } catch (error) {
    console.error("Error playing reverse card:", error);
    throw error;
  }
};

// 3. Robar hasta tener carta jugable (función recursiva con acumulador)
const drawUntilPlayable = async (playerHand, deck, currentCard) => {
  try {
    // Validar entrada
    if (!playerHand || !Array.isArray(playerHand)) {
      throw new Error("Mano del jugador inválida");
    }

    if (!deck || !Array.isArray(deck) || deck.length === 0) {
      throw new Error("Mazo de cartas vacío o inválido");
    }

    if (!currentCard) {
      throw new Error("Carta actual no especificada");
    }

    // Función para verificar si una carta es jugable
    const isCardPlayable = (card, topCard) => {
      // Lógica simplificada: una carta es jugable si coincide en color o valor
      const cardColor = card.split('_')[0];
      const cardValue = card.split('_')[1];
      const topColor = currentCard.split('_')[0];
      const topValue = currentCard.split('_')[1];
      
      return cardColor === topColor || cardValue === topValue;
    };

    // Función recursiva con acumulador para memorizar resultados
    const drawRecursive = async (currentHand, currentDeck, drawnCards = [], attempts = 0) => {
      // Límite de seguridad para evitar bucles infinitos
      if (attempts > 10 || currentDeck.length === 0) {
        return {
          success: false,
          drawn_cards: drawnCards,
          final_hand: currentHand,
          attempts: attempts,
          reason: attempts > 10 ? "max_attempts_reached" : "deck_empty"
        };
      }

      // Verificar si alguna carta en la mano actual es jugable
      const playableCard = currentHand.find(card => isCardPlayable(card, currentCard));
      
      if (playableCard) {
        return {
          success: true,
          drawn_cards: drawnCards,
          final_hand: currentHand,
          playable_card: playableCard,
          attempts: attempts
        };
      }

      // Si no hay carta jugable, robar una carta del mazo
      if (currentDeck.length > 0) {
        const drawnCard = currentDeck.shift(); // Remover la primera carta del mazo
        const newHand = [...currentHand, drawnCard];
        const newDrawnCards = [...drawnCards, drawnCard];
        
        // Llamada recursiva con el estado actualizado
        return drawRecursive(newHand, currentDeck, newDrawnCards, attempts + 1);
      }

      // Si no hay más cartas en el mazo
      return {
        success: false,
        drawn_cards: drawnCards,
        final_hand: currentHand,
        attempts: attempts,
        reason: "deck_empty"
      };
    };

    // Iniciar el proceso recursivo
    const result = await drawRecursive(playerHand, [...deck]);
    
    return {
      ...result,
      initial_hand_size: playerHand.length,
      final_hand_size: result.final_hand.length,
      cards_drawn: result.drawn_cards.length
    };
  } catch (error) {
    console.error("Error drawing until playable:", error);
    throw error;
  }
};

// Funciones auxiliares
const isPlayerTurn = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);
  return game.currentPlayerId === userId;
};

const getCurrentPlayerIndex = async (gameId, userId) => {
  const players = await getPlayersInGame(gameId);
  return players.findIndex(p => p.id === userId);
};

const getCurrentPlayer = async (gameId) => {
  const game = await Game.findByPk(gameId);
  if (!game || !game.currentPlayerId) return null;
  
  const players = await getPlayersInGame(gameId);
  return players.find(p => p.id === game.currentPlayerId);
};

const validateCardPlay = async (gameId, cardId, color) => {
  // Lógica simplificada de validación
  const topCard = await cardService.getTopCard(gameId);
  if (!topCard) return true;
  
  // Validar por color o valor
  const cardColor = color || cardId.split('_')[0];
  const cardValue = cardId.split('_')[1];
  const topColor = topCard.split('_')[0];
  const topValue = topCard.split('_')[1];
  
  return cardColor === topColor || cardValue === topValue;
};

const getCardValue = (card) => {
  if (!card) return 0;
  const value = card.split('_')[1];
  
  if (value === 'skip' || value === 'reverse' || value === 'draw2') {
    return 20;
  } else if (value === 'wild' || value === 'wild4') {
    return 50;
  } else if (isNaN(value)) {
    return 10; // Letras como A, B, C, etc.
  } else {
    return parseInt(value) || 0;
  }
};



export default {
  createGame,
  getGameById,
  updateGame,
  deleteGame,
  listGames,
  addPlayerToGame,
  getPlayersInGame,
  startGame,
  finishGame,
  removePlayerFromGame,
  endGame,
  dealCardsToPlayers,
  playCardWithRules,
  drawCardForPlayer,
  sayUno,
  challengeUno,
  endPlayerTurn,
  checkGameEnd,
  getGameStatus,
  getMoveHistory,
  getPlayerCards,
  getPlayerScores,
  handleMultiplayer,
  logGameError
};
