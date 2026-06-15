import { Router } from 'express';
import * as timelineController from '../controllers/timeline.controller.js';

const router = Router();

router.get('/', timelineController.getTimeline);

export default router;
