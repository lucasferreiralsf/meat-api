"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const environments_1 = require("./environments");
exports.logger = bunyan.createLogger({
    name: environments_1.environment.log.name,
    level: bunyan.resolveLevel(environments_1.environment.log.level)
});
