import asyncHandler from '../utils/asyncHandler.js';
import prisma from '../config/prisma.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'app-settings' },
  });
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { theme, shareEnabled } = req.body;
  const data = {};
  if (theme !== undefined) data.theme = theme;
  if (shareEnabled !== undefined) data.shareEnabled = shareEnabled;

  const settings = await prisma.appSettings.update({
    where: { id: 'app-settings' },
    data,
  });
  res.json({ success: true, data: settings });
});

export const clearAll = asyncHandler(async (req, res) => {
  await prisma.watchItem.deleteMany({});
  res.json({ success: true, message: 'All watch items cleared successfully' });
});
