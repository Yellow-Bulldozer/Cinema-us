import asyncHandler from '../utils/asyncHandler.js';

export const uploadPoster = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    data: {
      url: `/uploads/posters/${req.file.filename}`,
    },
  });
});
