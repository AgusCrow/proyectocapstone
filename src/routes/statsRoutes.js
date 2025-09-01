import express from 'express';
import statsController from '../controllers/statsController.js';

const router = express.Router();

router.get('/stats/requests', statsController.requests);
router.get('/stats/response-times', statsController.responseTimes);
router.get('/stats/status-codes', statsController.statusCodes);
router.get('/stats/popular-endpoints', statsController.popularEndpoints);

export default router;


