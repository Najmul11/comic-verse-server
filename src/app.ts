import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import config from './config';
import cookieParser from 'cookie-parser';
import globalErrorhandler from './app/middlewares/globalErrorHandler';
import Cloudinary from './cloudinary/cloudinary.config';
import { routes } from './app/routes';

const app: Application = express();

// cors
app.use(cors());
// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// cloudinary
Cloudinary();

// Application routes
app.use('/api/v1', routes);

app.get('/', (req: Request, res: Response) => {
  res.send(`Comic-verse Server running on port ${config.port}`);
});

// middleware
app.use(globalErrorhandler);

// handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
