"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environments_1 = require("./common/environments");
const server_1 = require("./server/server");
const users_router_1 = require("./users/users.router");
const users_model_1 = require("./users/users.model");
const reviews_router_1 = require("./reviews/reviews.router");
const reviews_model_1 = require("./reviews/reviews.model");
const jestCli = require("jest-cli");
let server;
let address = 'http://localhost:3001';
const beforeAllTests = () => {
    environments_1.environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test';
    environments_1.environment.server.port = process.env.SERVER_PORT || 3001;
    address = `http://localhost:${environments_1.environment.server.port}`;
    server = new server_1.Server();
    return server
        .bootstrap([users_router_1.usersRouter, reviews_router_1.reviewsRouter])
        .then(() => users_model_1.User.deleteMany({}).exec())
        .then(() => {
        let admin = new users_model_1.User();
        admin.name = 'admin',
            admin.email = 'admin@meat.com',
            admin.password = '123',
            admin.profiles = ['admin', 'user'];
        return admin.save();
    })
        .then(() => reviews_model_1.Review.deleteMany({}).exec());
};
const afterAllTests = () => {
    return server.shutdown();
};
beforeAllTests()
    .then(() => jestCli.run())
    .then(() => afterAllTests())
    .catch(console.error);
