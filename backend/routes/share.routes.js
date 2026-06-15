import { Router } from 'express';
import * as shareController from '../controllers/share.controller.js';
import shareAuth from '../middleware/shareAuth.js';

const router = Router();

router.get('/status', shareController.getShareStatus);
router.post('/toggle', shareController.toggleShare);
router.get('/:token', shareAuth, shareController.getSharedData);

export default router;
