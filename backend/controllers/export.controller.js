import asyncHandler from '../utils/asyncHandler.js';
import * as exportService from '../services/export.service.js';

export const exportJSON = asyncHandler(async (req, res) => {
  const data = await exportService.exportJSON();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=watchlist.json');
  res.json(data);
});

export const exportCSV = asyncHandler(async (req, res) => {
  const csv = await exportService.exportCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=watchlist.csv');
  res.send(csv);
});

export const exportPDF = asyncHandler(async (req, res) => {
  const pdfBuffer = await exportService.exportPDF();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=watchlist.pdf');
  res.send(pdfBuffer);
});
