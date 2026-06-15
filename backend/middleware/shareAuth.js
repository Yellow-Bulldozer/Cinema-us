import prisma from '../config/prisma.js';

const shareAuth = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'Share token is required',
      });
    }

    const settings = await prisma.appSettings.findUnique({
      where: { id: 'app-settings' },
    });

    if (!settings) {
      return res.status(500).json({
        success: false,
        message: 'App settings not found',
      });
    }

    if (!settings.shareEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Sharing is currently disabled',
      });
    }

    if (settings.shareToken !== token) {
      return res.status(403).json({
        success: false,
        message: 'Invalid share token',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default shareAuth;
