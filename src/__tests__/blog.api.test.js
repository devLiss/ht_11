"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
describe('/blogs', () => {
    it("should return blogs", () => {
        (0, supertest_1.default)(index_1.app).get('/blogs').expect(200);
    });
});
