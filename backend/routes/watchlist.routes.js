import { Router } from 'express';
import upload from '../config/multer.js';
import * as watchlistController from '../controllers/watchlist.controller.js';

const router = Router();

router.get('/', watchlistController.getAll);
router.get('/:id', watchlistController.getById);
router.post('/', upload.single('poster'), watchlistController.create);
router.put('/:id', upload.single('poster'), watchlistController.update);
router.delete('/:id', watchlistController.remove);
router.patch('/:id/status', watchlistController.updateStatus);
router.patch('/:id/favorite', watchlistController.toggleFavorite);

export default router;
