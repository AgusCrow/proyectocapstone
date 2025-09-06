import express from 'express';
import { createCard, deleteCard, getCard, listCards, updateCard } from '../controllers/cardsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createCard);
router.get('/:id', authMiddleware, getCard);
router.put('/:id', authMiddleware, updateCard);
router.delete('/:id', authMiddleware, deleteCard);
router.get('/', authMiddleware, listCards);

export default router;