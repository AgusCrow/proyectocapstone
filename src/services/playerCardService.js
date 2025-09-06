import { Card, Game, Player, PlayerCard } from '../orm/index.js';
// Importa el objeto Op directamente desde 'sequelize' para usar operadores
import { Op } from 'sequelize';
import functional from '../utils/functional.js';

// Ahora, importamos las funciones que necesitemos de functional.js
const { map, identity } = functional;

// Función para barajar un array, movida aquí para evitar errores de importación
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Repartir cartas iniciales a un jugador
const dealInitialCards = async (gameId, playerId, numberOfCards = 7) => {
    try {
        // Obtener cartas disponibles (no usadas en este juego)
        const usedCards = await PlayerCard.findAll({
            where: { gameId },
            attributes: ['cardId']
        });

        const usedCardIds = usedCards.map(pc => pc.cardId);

        // Obtener todas las cartas no usadas del mazo
        const allAvailableCards = await Card.findAll({
            where: {
                id: { [Op.notIn]: usedCardIds }
            },
        });

        // Asegurarse de que haya suficientes cartas en el mazo para el reparto
        if (allAvailableCards.length < numberOfCards) {
            throw new Error('No hay suficientes cartas disponibles');
        }

        // Barajar las cartas disponibles para un reparto aleatorio
        const shuffledCards = shuffleArray(allAvailableCards);

        // Tomar las primeras 'numberOfCards' del mazo barajado
        const cardsToDeal = shuffledCards.slice(0, numberOfCards);
        
        // Crear PlayerCard records para cada carta
        const playerCards = await Promise.all(
            cardsToDeal.map(card =>
                PlayerCard.create({
                    playerId,
                    gameId,
                    cardId: card.id,
                    isPlayed: false
                })
            )
        );

        return playerCards;
    } catch (error) {
        console.error('Error dealing initial cards:', error);
        throw error;
    }
};

// Obtener las cartas en mano de un jugador
const getPlayerHand = async (gameId, playerId) => {
    try {
        const playerCards = await PlayerCard.findAll({
            where: {
                gameId,
                playerId,
                isPlayed: false
            },
            include: [
                {
                    model: Card,
                    attributes: ['id', 'color', 'value', 'type']
                }
            ]
        });

        return map(playerCard => ({
            id: playerCard.id,
            card: playerCard.Card,
            isPlayed: playerCard.isPlayed
        }))(playerCards);
    } catch (error) {
        console.error('Error getting player hand:', error);
        throw error;
    }
};

// Jugar una carta
const playCard = async (playerCardId, playerId) => {
    try {
        const playerCard = await PlayerCard.findOne({
            where: {
                id: playerCardId,
                playerId,
                isPlayed: false
            },
            include: [Card]
        });

        if (!playerCard) {
            throw new Error('Carta no encontrada o ya jugada');
        }

        // Marcar la carta como jugada
        await playerCard.update({
            isPlayed: true,
            playedAt: new Date()
        });

        return playerCard;
    } catch (error) {
        console.error('Error playing card:', error);
        throw error;
    }
};

// Obtener cartas jugadas en un juego
const getPlayedCards = async (gameId) => {
    try {
        const playedCards = await PlayerCard.findAll({
            where: {
                gameId,
                isPlayed: true
            },
            include: [
                {
                    model: Card,
                    attributes: ['id', 'color', 'value', 'type']
                },
                {
                    model: Player,
                    attributes: ['id', 'username']
                }
            ],
            order: [['playedAt', 'DESC']]
        });

        return map(playerCard => ({
            id: playerCard.id,
            card: playerCard.Card,
            player: playerCard.Player,
            playedAt: playerCard.playedAt
        }))(playedCards);
    } catch (error) {
        console.error('Error getting played cards:', error);
        throw error;
    }
};

// Obtener la última carta jugada
const getLastPlayedCard = async (gameId) => {
    try {
        const lastCard = await PlayerCard.findOne({
            where: {
                gameId,
                isPlayed: true
            },
            include: [
                {
                    model: Card,
                    attributes: ['id', 'color', 'value', 'type']
                },
                {
                    model: Player,
                    attributes: ['id', 'username']
                }
            ],
            order: [['playedAt', 'DESC']]
        });

        if (!lastCard) return null;

        return {
            id: lastCard.id,
            card: lastCard.Card,
            player: lastCard.Player,
            playedAt: lastCard.playedAt
        };
    } catch (error) {
        console.error('Error getting last played card:', error);
        throw error;
    }
};

// Robar una carta
const drawCard = async (gameId, playerId) => {
    try {
        // Verificar si el juego existe
        const game = await Game.findByPk(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        // Verificar si el jugador existe
        const player = await Player.findByPk(playerId);
        if (!player) {
            throw new Error('Jugador no encontrado');
        }

        // Obtener cartas disponibles
        const usedCards = await PlayerCard.findAll({
            where: { gameId },
            attributes: ['cardId']
        });
        const usedCardIds = usedCards.map(pc => pc.cardId);
        
        // Obtener una carta aleatoria no usada
        const availableCard = await Card.findOne({
            where: {
                id: { [Op.notIn]: usedCardIds }
            },
            order: Card.sequelize.random()
        });
        
        if (!availableCard) {
            throw new Error('No hay cartas disponibles para robar');
        }
        
        // Crear PlayerCard record
        const playerCard = await PlayerCard.create({
            playerId,
            gameId,
            cardId: availableCard.id,
            isPlayed: false
        });
        
        return {
            id: playerCard.id,
            card: availableCard,
            isPlayed: false
        };
    } catch (error) {
        console.error('Error drawing card:', error);
        throw error;
    }
};

// Repartir cartas a todos los jugadores cuando inicia el juego
const dealCardsToAllPlayers = async (gameId) => {
    try {
        const game = await Game.findByPk(gameId);
        if (!game) throw new Error('Juego no encontrado');

        const players = await game.getPlayers();
        // Repartir 7 cartas a cada jugador
        await Promise.all(
            players.map(player => dealInitialCards(gameId, player.id, 7))
        );

        return true;
    } catch (error) {
        console.error('Error dealing cards to all players:', error);
        throw error;
    }
};
// Crear una carta de jugador
const createPlayerCard = async (data) => {
    try {
        const { playerId, gameId, cardId } = data;
        const playerCard = await PlayerCard.create({
            playerId,
            gameId,
            cardId,
            isPlayed: false
        });
        return playerCard;
    } catch (error) {
        console.error('Error creating player card:', error);
        throw error;
    }
};

// Actualizar una carta de jugador
const updatePlayerCard = async (id, data) => {
    try {
        const playerCard = await PlayerCard.findByPk(id);
        if (!playerCard) return null;
        
        const updatedPlayerCard = await playerCard.update(data);
        return updatedPlayerCard;
    } catch (error) {
        console.error('Error updating player card:', error);
        throw error;
    }
};

// Eliminar una carta de jugador
const deletePlayerCard = async (id) => {
    try {
        const playerCard = await PlayerCard.findByPk(id);
        if (!playerCard) return false; // Cambiado de null a false
        
        await playerCard.destroy();
        return true;
    } catch (error) {
        console.error('Error deleting player card:', error);
        throw error;
    }
};

// Obtener cartas de un juego
const getPlayerCardsByGame = async (gameId) => {
    try {
        const playerCards = await PlayerCard.findAll({
            where: { gameId },
            include: [
                {
                    model: Card,
                    attributes: ['id', 'color', 'value', 'type']
                },
                {
                    model: Player,
                    attributes: ['id', 'username']
                }
            ]
        });
        return playerCards;
    } catch (error) {
        console.error('Error getting player cards by game:', error);
        throw error;
    }
};

// Obtener cartas de un jugador
const getPlayerCardsByPlayer = async (playerId) => {
    try {
        const playerCards = await PlayerCard.findAll({
            where: { playerId },
            include: [
                {
                    model: Card,
                    attributes: ['id', 'color', 'value', 'type']
                }
            ]
        });
        return playerCards;
    } catch (error) {
        console.error('Error getting player cards by player:', error);
        throw error;
    }
};

// Obtener una carta específica de un jugador
const getPlayerCard = async (gameId, playerId, cardId) => {
    try {
        const playerCard = await PlayerCard.findOne({
            where: {
                gameId,
                playerId,
                cardId
            },
            include: [Card]
        });
        return playerCard;
    } catch (error) {
        console.error('Error getting player card:', error);
        throw error;
    }
};

// Repartir una carta a un jugador
const dealCardToPlayer = async (gameId, playerId) => {
    try {
        // Obtener cartas disponibles
        const usedCards = await PlayerCard.findAll({
            where: { gameId },
            attributes: ['cardId']
        });
        const usedCardIds = usedCards.map(pc => pc.cardId);
        
        // Obtener una carta aleatoria no usada
        const availableCard = await Card.findOne({
            where: {
                id: { [Op.notIn]: usedCardIds }
            },
            order: Card.sequelize.random()
        });
        
        if (!availableCard) {
            throw new Error('No hay cartas disponibles para repartir');
        }
        
        // Crear PlayerCard record
        const playerCard = await PlayerCard.create({
            playerId,
            gameId,
            cardId: availableCard.id,
            isPlayed: false
        });
        
        return {
            id: playerCard.id,
            card: availableCard,
            isPlayed: false
        };
    } catch (error) {
        console.error('Error dealing card to player:', error);
        throw error;
    }
};

// Establecer estado UNO
const setUnoStatus = async (gameId, playerId, status) => {
    try {
        // En una implementación real, esto se guardaría en la base de datos
        // Para este ejemplo, usamos un almacenamiento en memoria
        if (!global.unoStatus) global.unoStatus = {};
        const key = `${gameId}_${playerId}`;
        global.unoStatus[key] = status;
        return true;
    } catch (error) {
        console.error('Error setting UNO status:', error);
        throw error;
    }
};

// Obtener estado UNO
const getUnoStatus = async (gameId, playerId) => {
    try {
        // En una implementación real, esto se obtendría de la base de datos
        if (!global.unoStatus) global.unoStatus = {};
        const key = `${gameId}_${playerId}`;
        return global.unoStatus[key] || false;
    } catch (error) {
        console.error('Error getting UNO status:', error);
        throw error;
    }
};
const getTopCard = async (gameId) => {
  try {
    // Buscar la última carta jugada en el juego
    const lastPlayedCard = await PlayerCard.findOne({
      where: { gameId, isPlayed: true },
      include: [Card],
      order: [['playedAt', 'DESC']]
    });

    if (lastPlayedCard) {
      // Formatear la carta como "color_valor"
      const color = lastPlayedCard.Card.color || 'red';
      const value = lastPlayedCard.Card.value || '0';
      return `${color}_${value}`;
    }

    // Si no hay cartas jugadas, obtener una carta aleatoria
    const randomCard = await Card.findOne({
      order: Card.sequelize.random()
    });

    if (randomCard) {
      const color = randomCard.color || 'blue';
      const value = randomCard.value || '7';
      return `${color}_${value}`;
    }

    return null;
  } catch (error) {
    console.error('Error getting top card:', error);
    throw error;
  }
};

export default {
    dealInitialCards,
    getPlayerHand,
    playCard,
    getPlayedCards,
    getLastPlayedCard,
    drawCard,
    dealCardsToAllPlayers,
    createPlayerCard,
    updatePlayerCard,
    deletePlayerCard,
    getPlayerCardsByGame,
    getPlayerCardsByPlayer,
    getPlayerCard,
    dealCardToPlayer,
    setUnoStatus,
    getUnoStatus,
    getTopCard
};