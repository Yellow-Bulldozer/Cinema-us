import asyncHandler from '../utils/asyncHandler.js';
import * as importService from '../services/import.service.js';
import fs from 'fs';

export const importJSON = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileContent = fs.readFileSync(req.file.path, 'utf-8');
  let jsonData;

  try {
    jsonData = JSON.parse(fileContent);
  } catch (e) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'Invalid JSON file' });
  }

  // Clean up uploaded file after reading
  fs.unlinkSync(req.file.path);

  const result = await importService.importJSON(jsonData);
  res.json({ success: true, data: result });
});
