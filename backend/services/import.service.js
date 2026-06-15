import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

export const importJSON = async (jsonData) => {
  if (!Array.isArray(jsonData)) {
    throw new ApiError(400, 'Import data must be an array');
  }

  let imported = 0;

  for (const item of jsonData) {
    if (!item.title || !item.type) {
      continue; // Skip invalid items
    }

    await prisma.watchItem.create({
      data: {
        title: item.title,
        type: item.type,
        rating: item.rating || 0,
        experience: item.experience || '',
        status: item.status || 'Not Watched',
        favorite: item.favorite || false,
        watchedDate: item.watchedDate || null,
        poster: item.poster || null,
        platform: item.platform || null,
        genre: item.genre || null,
        mood: item.mood || null,
        pinned: item.pinned || false,
      },
    });
    imported++;
  }

  return { imported, total: jsonData.length };
};
