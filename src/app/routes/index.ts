import express from "express";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: "example",
  },
];

// moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const routes = router;
