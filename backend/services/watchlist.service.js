import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { STATUSES } from '../utils/constants.js';

export const getAll = async ({ search, type, status, favorite, genre, platform, mood, sort = 'newest', page = 1, limit = 12 }) => {
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { genre: { contains: search } },
      { platform: { contains: search } },
      { mood: { contains: search } },
    ];
  }
  if (type) {
    where.type = type;
  }
  if (status) {
    where.status = status;
  }
  if (favorite !== undefined && favorite !== null && favorite !== '') {
    where.favorite = favorite === 'true' || favorite === true;
  }
  if (genre) {
    where.genre = genre;
  }
  if (platform) {
    where.platform = platform;
  }
  if (mood) {
    where.mood = mood;
  }

  // Sort mapping
  const sortMap = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    highest: { rating: 'desc' },
    lowest: { rating: 'asc' },
    az: { title: 'asc' },
    za: { title: 'desc' },
  };

  const selectedSort = sortMap[sort] || sortMap.newest;

  // Always sort pinned first, then favorites, then selected sort
  const orderBy = [
    { pinned: 'desc' },
    { favorite: 'desc' },
    selectedSort,
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [items, total] = await Promise.all([
    prisma.watchItem.findMany({ where, orderBy, skip, take }),
    prisma.watchItem.count({ where }),
  ]);

  return {
    items,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  };
};

export const getById = async (id) => {
  const item = await prisma.watchItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(404, 'Watch item not found');
  }
  return item;
};

export const create = async (data) => {
  const item = await prisma.watchItem.create({ data });
  return item;
};

export const update = async (id, data) => {
  await getById(id); // Check exists
  const item = await prisma.watchItem.update({ where: { id }, data });
  return item;
};

export const remove = async (id) => {
  await getById(id); // Check exists
  await prisma.watchItem.delete({ where: { id } });
  return { message: 'Watch item deleted successfully' };
};

export const updateStatus = async (id, status) => {
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${STATUSES.join(', ')}`);
  }
  await getById(id); // Check exists
  const item = await prisma.watchItem.update({
    where: { id },
    data: { status },
  });
  return item;
};

export const toggleFavorite = async (id) => {
  const item = await getById(id);
  const updated = await prisma.watchItem.update({
    where: { id },
    data: { favorite: !item.favorite },
  });
  return updated;
};
