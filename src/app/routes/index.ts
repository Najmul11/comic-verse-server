import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { BookRoute } from '../modules/book/book.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/books',
    route: BookRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export const routes = router;
