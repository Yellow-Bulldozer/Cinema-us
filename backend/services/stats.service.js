import prisma from '../config/prisma.js';

export const getStats = async () => {
  const [totalMovies, totalSeries, notWatched, watching, completed, favorites, avgRating, recentlyAdded] = await Promise.all([
    prisma.watchItem.count({ where: { type: 'Movie' } }),
    prisma.watchItem.count({ where: { type: 'Series' } }),
    prisma.watchItem.count({ where: { status: 'Not Watched' } }),
    prisma.watchItem.count({ where: { status: 'Watching' } }),
    prisma.watchItem.count({ where: { status: 'Completed' } }),
    prisma.watchItem.count({ where: { favorite: true } }),
    prisma.watchItem.aggregate({ _avg: { rating: true } }),
    prisma.watchItem.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return {
    totalMovies,
    totalSeries,
    totalItems: totalMovies + totalSeries,
    statusCounts: {
      notWatched,
      watching,
      completed,
    },
    favorites,
    averageRating: avgRating._avg.rating || 0,
    recentlyAdded,
  };
};
