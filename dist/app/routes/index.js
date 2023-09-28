"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/user/user.route");
const book_route_1 = require("../modules/book/book.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/books',
        route: book_route_1.BookRoute,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.routes = router;
