import express from 'express';
import gamesController from '../controllers/gamesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, gamesController.createGame);
router.get('/', authMiddleware, gamesController.listGames);
router.get('/:gameId', authMiddleware, gamesController.getGameById);
router.put('/:gameId', authMiddleware, gamesController.updateGame);
router.delete('/:gameId', authMiddleware, gamesController.deleteGame);
router.post('/:gameId/start', authMiddleware, gamesController.startGame);
router.post('/:gameId/end', authMiddleware, gamesController.endGame);
router.post('/:gameId/join', authMiddleware, gamesController.addPlayerToGame);
router.post('/:gameId/leave', authMiddleware, gamesController.removePlayerFromGame);
router.get('/:gameId/state', authMiddleware, gamesController.getGameStatus);
router.get('/:gameId/players', authMiddleware, gamesController.getPlayersInGame);
router.get('/:gameId/current-player', authMiddleware, gamesController.getCurrentPlayer);
router.get('/:gameId/top-card', authMiddleware, gamesController.getTopCard);
router.post("/:gameId/deal-cards", authMiddleware, gamesController.dealCardsToPlayers);
router.post("/:gameId/play-card", authMiddleware, gamesController.playCardWithRules);
router.post("/:gameId/draw-card", authMiddleware, gamesController.drawCardForPlayer);
router.post("/:gameId/say-uno", authMiddleware, gamesController.sayUno);
router.post("/:gameId/challenge-uno", authMiddleware, gamesController.challengeUno);
router.post("/:gameId/end-turn", authMiddleware, gamesController.endPlayerTurn);
router.get("/:gameId/check-end", gamesController.checkGameEnd);
router.get("/:gameId/status", gamesController.getGameStatus);
router.get("/:gameId/history", gamesController.getMoveHistory);
router.get("/:gameId/my-cards", authMiddleware, gamesController.getPlayerCards);
router.get("/:gameId/scores", gamesController.getPlayerScores);
router.post("/:gameId/multiplayer", authMiddleware, gamesController.handleMultiplayer);
router.post("/:gameId/log-error", authMiddleware, gamesController.logGameError);
router.post("/:gameId/play-skip-card", authMiddleware, gamesController.playSkipCard);
router.post("/:gameId/play-reverse-card", authMiddleware, gamesController.playReverseCard);
router.post("/:gameId/draw-until-playable", authMiddleware, gamesController.drawUntilPlayable);

export default router;