import asyncHandler from '../utils/asyncHandler.js';
import * as watchlistService from '../services/watchlist.service.js';
import ApiError from '../utils/ApiError.js';
import { STATUSES, TYPES } from '../utils/constants.js';

const normalizePayload = (body, file) => {
  const data = { ...body };

  if (!data.title || !data.type) {
    throw new ApiError(400, 'Title and type are required');
  }
  if (!TYPES.includes(data.type)) {
    throw new ApiError(400, `Type must be one of: ${TYPES.join(', ')}`);
  }
  if (data.status && !STATUSES.includes(data.status)) {
    throw new ApiError(400, `Status must be one of: ${STATUSES.join(', ')}`);
  }
  if (data.rating !== undefined && data.rating !== '') {
    data.rating = Math.min(10, Math.max(0, parseFloat(data.rating)));
  }
  if (data.favorite !== undefined) data.favorite = data.favorite === 'true' || data.favorite === true;
  if (data.pinned !== undefined) data.pinned = data.pinned === 'true' || data.pinned === true;
  if (file) data.poster = `/uploads/posters/${file.filename}`;

  return data;
};

export const getAll = asyncHandler(async (req, res) => {
  const { search, type, status, favorite, genre, platform, mood, sort, page, limit } = req.query;
  const data = await watchlistService.getAll({ search, type, status, favorite, genre, platform, mood, sort, page, limit });
  res.json({ success: true, data });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await watchlistService.getById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = normalizePayload(req.body, req.file);
  const item = await watchlistService.create(data);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const data = normalizePayload(req.body, req.file);
  const item = await watchlistService.update(req.params.id, data);
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await watchlistService.remove(req.params.id);
  res.json({ success: true, ...result });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  const data = await watchlistService.updateStatus(req.params.id, status);
  res.json({ success: true, data });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const data = await watchlistService.toggleFavorite(req.params.id);
  res.json({ success: true, data });
});
