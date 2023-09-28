"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("./config"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const cloudinary_config_1 = __importDefault(require("./cloudinary/cloudinary.config"));
const routes_1 = require("./app/routes");
const app = (0, express_1.default)();
// cors
app.use((0, cors_1.default)());
// parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// cloudinary
(0, cloudinary_config_1.default)();
// Application routes
app.use('/api/v1', routes_1.routes);
app.get('/', (req, res) => {
    res.send(`Comic-verse Server running on port ${config_1.default.port}`);
});
// middleware
app.use(globalErrorHandler_1.default);
// handle not found
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
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
exports.default = app;
