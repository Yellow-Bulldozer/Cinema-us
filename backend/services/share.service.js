import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

export const getShareStatus = async () => {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'app-settings' },
  });

  if (!settings) {
    throw new ApiError(500, 'App settings not found');
  }

  return {
    shareEnabled: settings.shareEnabled,
    shareToken: settings.shareToken,
  };
};

export const toggleShare = async () => {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'app-settings' },
  });

  if (!settings) {
    throw new ApiError(500, 'App settings not found');
  }

  const updated = await prisma.appSettings.update({
    where: { id: 'app-settings' },
    data: { shareEnabled: !settings.shareEnabled },
  });

  return {
    shareEnabled: updated.shareEnabled,
    shareToken: updated.shareToken,
  };
};

export const getSharedData = async (token) => {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'app-settings' },
  });

  if (!settings) {
    throw new ApiError(500, 'App settings not found');
  }

  if (!settings.shareEnabled) {
    throw new ApiError(403, 'Sharing is currently disabled');
  }

  if (settings.shareToken !== token) {
    throw new ApiError(403, 'Invalid share token');
  }

  const items = await prisma.watchItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return items;
};
