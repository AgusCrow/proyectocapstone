import playerCardService from '../services/playerCardService.js';

// Obtener las cartas en mano del jugador
const getPlayerHand = async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const playerId = req.user.id;
        
        const hand = await playerCardService.getPlayerHand(gameId, playerId);
        
        res.json({
            game_id: gameId,
            player_id: playerId,
            cards: hand
        });
    } catch (error) {
        console.error('Error getting player hand:', error);
        res.status(500).json({ error: 'Error al obtener las cartas en mano' });
    }
};

// Jugar una carta
const playCard = async (req, res) => {
    try {
        const { playerCardId } = req.body;
        const playerId = req.user.id;
        
        if (!playerCardId) {
            return res.status(400).json({ error: 'ID de carta requerido' });
        }
        
        const playedCard = await playerCardService.playCard(playerCardId, playerId);
        
        res.json({
            message: 'Carta jugada exitosamente',
            card: {
                id: playedCard.id,
                card: playedCard.Card,
                playedAt: playedCard.playedAt
            }
        });
    } catch (error) {
        console.error('Error playing card:', error);
        if (error.message === 'Carta no encontrada o ya jugada') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al jugar la carta' });
    }
};

// Robar una carta
const drawCard = async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const playerId = req.user.id;
        
        const drawnCard = await playerCardService.drawCard(gameId, playerId);
        
        res.json({
            message: 'Carta robada exitosamente',
            card: drawnCard
        });
    } catch (error) {
        console.error('Error drawing card:', error);
        if (error.message === 'No hay cartas disponibles para robar') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al robar carta' });
    }
};

// Obtener cartas jugadas en el juego
const getPlayedCards = async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        const playedCards = await playerCardService.getPlayedCards(gameId);
        
        res.json({
            game_id: gameId,
            played_cards: playedCards
        });
    } catch (error) {
        console.error('Error getting played cards:', error);
        res.status(500).json({ error: 'Error al obtener cartas jugadas' });
    }
};

// Obtener la última carta jugada
const getLastPlayedCard = async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        const lastCard = await playerCardService.getLastPlayedCard(gameId);
        
        if (!lastCard) {
            return res.json({
                game_id: gameId,
                last_card: null,
                message: 'No hay cartas jugadas aún'
            });
        }
        
        res.json({
            game_id: gameId,
            last_card: lastCard
        });
    } catch (error) {
        console.error('Error getting last played card:', error);
        res.status(500).json({ error: 'Error al obtener la última carta jugada' });
    }
};

export default {
    getPlayerHand,
    playCard,
    drawCard,
    getPlayedCards,
    getLastPlayedCard
}; 