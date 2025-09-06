import express from 'express';
import playerCardController from '../controllers/playerCardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener las cartas en mano del jugador
router.get('/games/:gameId/hand', authMiddleware, playerCardController.getPlayerHand);

// Jugar una carta
router.post('/games/:gameId/play-card', authMiddleware, playerCardController.playCard);

// Robar una carta
router.post('/games/:gameId/draw-card', authMiddleware, playerCardController.drawCard);

// Obtener cartas jugadas en el juego
router.get('/games/:gameId/played-cards', authMiddleware, playerCardController.getPlayedCards);

// Obtener la última carta jugada
router.get('/games/:gameId/last-card', authMiddleware, playerCardController.getLastPlayedCard);

export default router; 