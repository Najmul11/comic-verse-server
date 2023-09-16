import express from 'express';
import singleUpload from '../../middlewares/multer';
import { BookController } from './book.controller';
import auth from '../../middlewares/auth';
import specificAuth from '../../middlewares/specificAuth';

const router = express.Router();

router.patch('/reviews/delete/:id', auth, BookController.deleteReview);

router.patch('/reviews/:id', auth, BookController.postReview);

router.patch(
  '/:id',
  auth,
  specificAuth,
  singleUpload,
  BookController.updateBook,
);

router.get('/:id', BookController.getSingleBook);

router.delete('/:id', auth, specificAuth, BookController.deleteBook);

router.post('/list-book', auth, singleUpload, BookController.createBook);

router.get('/', BookController.getAllBooks);

export const BookRoute = router;
