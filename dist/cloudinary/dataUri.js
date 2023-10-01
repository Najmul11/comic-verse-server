"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const parser_js_1 = __importDefault(require("datauri/parser.js"));
const path_1 = __importDefault(require("path"));
const getDataUri = (file) => {
    const parser = new parser_js_1.default();
    const extName = path_1.default.extname(file.originalname).toString();
    parser.format(extName, file.buffer);
    const fileUri = parser.content;
    return fileUri;
};
exports.default = getDataUri;
