import express from 'express';
import singleUpload from '../../middlewares/multer';
import { BookController } from './book.controller';

const router = express.Router();

router.patch('/:id', singleUpload, BookController.updateBook);

router.post('/list-book', singleUpload, BookController.createBook);

router.get('/', BookController.getAllBooks);

export const BookRoute = router;
