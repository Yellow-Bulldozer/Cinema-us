import asyncHandler from '../utils/asyncHandler.js';
import * as timelineService from '../services/timeline.service.js';

export const getTimeline = asyncHandler(async (req, res) => {
  const data = await timelineService.getTimeline();
  res.json({ success: true, data });
});
