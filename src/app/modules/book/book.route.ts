import express from 'express';
import singleUpload from '../../middlewares/multer';
import { BookController } from './book.controller';

const router = express.Router();

router.post('/list-book', singleUpload, BookController.createBook);

export const BookRoute = router;
