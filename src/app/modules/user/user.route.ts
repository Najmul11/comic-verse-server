import express from 'express';
import { UserController } from './user.controller';
import singleUpload from '../../middlewares/multer';
import validateRequest from '../../middlewares/validateRequest';
import { Uservalidation } from './user.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.patch('/wishlist/delete/:id', auth, UserController.deleteFromWishlist);

router.patch('/wishlist/:id', auth, UserController.addToWishlist);

router.post('/signup', singleUpload, UserController.createUser);

router.post(
  '/login',
  validateRequest(Uservalidation.userLoginZodSchema),
  UserController.loginUser,
);

router.post(
  '/refresh-token',
  validateRequest(Uservalidation.refreshTokenZodSchema),
  UserController.refreshToken,
);

export const UserRoutes = router;
