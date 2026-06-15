import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2002':
        statusCode = 409;
        message = `Duplicate value for field: ${err.meta?.target}`;
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference - related record not found';
        break;
      default:
        statusCode = 400;
        message = `Database error: ${err.message}`;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  console.error(`❌ [${statusCode}] ${message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
