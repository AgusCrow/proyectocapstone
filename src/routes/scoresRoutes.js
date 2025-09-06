import express from 'express';
import scoresController from '../controllers/scoresController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, scoresController.createScore);
router.get('/:id', authMiddleware, scoresController.getScore);
router.put('/:id', authMiddleware, scoresController.updateScore);
router.delete('/:id', authMiddleware, scoresController.deleteScore);
router.get('/', authMiddleware, scoresController.listScores);

export default router;