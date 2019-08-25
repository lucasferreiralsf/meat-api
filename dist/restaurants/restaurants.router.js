"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const restaurants_model_1 = require("./restaurants.model");
const restify_errors_1 = require("restify-errors");
const authz_handler_1 = require("../security/authz.handler");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurants_model_1.Restaurant);
        this.findMenu = (req, res, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id, '+menu')
                .then(rest => {
                if (!rest) {
                    next(new restify_errors_1.NotFoundError('Restaurant not found.'));
                }
                else {
                    res.send(rest.menu);
                    return next();
                }
            })
                .catch(next);
        };
        this.replaceMenu = (req, res, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id)
                .then(rest => {
                if (!rest) {
                    next(new restify_errors_1.NotFoundError('Restaurant not found.'));
                }
                else {
                    rest.menu = req.body; // Deve ser um array de MenuItem
                    return rest.save();
                }
            })
                .then(rest => {
                res.send(rest.menu);
                return next();
            })
                .catch(next);
        };
    }
    envelope(document) {
        let resource = super.envelope(document);
        resource._links.menu = `${this.basePath}/${resource._id}/menu`;
        return resource;
    }
    applyRoutes(application) {
        application.get(`${this.basePath}`, this.findAll);
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]);
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.replace]);
        application.put(`${this.basePath}/:id/menu`, [authz_handler_1.authorize('admin'), this.validateId, this.replaceMenu]);
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
    }
}
exports.restaurantsRouter = new RestaurantsRouter();
