import { Router } from 'express';
import * as exportController from '../controllers/export.controller.js';

const router = Router();

router.get('/json', exportController.exportJSON);
router.get('/csv', exportController.exportCSV);
router.get('/pdf', exportController.exportPDF);

export default router;
