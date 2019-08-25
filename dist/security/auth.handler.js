"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const users_model_1 = require("../users/users.model");
const restify_errors_1 = require("restify-errors");
const environments_1 = require("../common/environments");
exports.authenticate = (req, res, next) => {
    const { email, password } = req.body;
    users_model_1.User.findByEmail(email, '+password')
        .then(user => {
        if (user && user.matches(password)) {
            // @ts-ignore
            const token = jwt.sign({ sub: user.email, iss: 'meat-api' }, environments_1.environment.security.apiSecret);
            res.send({ name: user.name, email: user.email, token });
            return next(false);
        }
        else {
            return next(new restify_errors_1.NotAuthorizedError('Invalid Credentials.'));
        }
    })
        .catch(next);
};
