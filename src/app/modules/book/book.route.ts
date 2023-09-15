import express from 'express';
import singleUpload from '../../middlewares/multer';
import { BookController } from './book.controller';

const router = express.Router();

router.patch('/:id', singleUpload, BookController.updateBook);

router.get('/:id', BookController.getSingleBook);

router.delete('/:id', BookController.deleteBook);

router.post('/list-book', singleUpload, BookController.createBook);

router.get('/', BookController.getAllBooks);

export const BookRoute = router;
