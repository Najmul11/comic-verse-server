import express from 'express';
import { UserController } from './user.controller';
import singleUpload from '../../middlewares/multer';

const router = express.Router();

router.post('/signup', singleUpload, UserController.createUser);

export const UserRoutes = router;
