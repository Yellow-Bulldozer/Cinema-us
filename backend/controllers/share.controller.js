import asyncHandler from '../utils/asyncHandler.js';
import * as shareService from '../services/share.service.js';

export const getShareStatus = asyncHandler(async (req, res) => {
  const data = await shareService.getShareStatus();
  res.json({ success: true, data });
});

export const toggleShare = asyncHandler(async (req, res) => {
  const data = await shareService.toggleShare();
  res.json({ success: true, data });
});

export const getSharedData = asyncHandler(async (req, res) => {
  const data = await shareService.getSharedData(req.params.token);
  res.json({ success: true, data });
});
