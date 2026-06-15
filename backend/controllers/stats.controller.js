import asyncHandler from '../utils/asyncHandler.js';
import * as statsService from '../services/stats.service.js';

export const getStats = asyncHandler(async (req, res) => {
  const data = await statsService.getStats();
  res.json({ success: true, data });
});
