import { Router } from 'express';
import multer from 'multer';
import * as importController from '../controllers/import.controller.js';

const uploadImport = multer({ dest: 'uploads/imports/' });
const router = Router();

router.post('/json', uploadImport.single('file'), importController.importJSON);

export default router;
