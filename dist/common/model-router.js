"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 10;
        this.validateId = (req, res, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found.'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, res, next) => {
            const reqPageSize = parseInt(req.query._pageSize);
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * (reqPageSize ? reqPageSize : this.pageSize);
            this.model
                .countDocuments({})
                .exec()
                .then(count => this.model
                .find()
                .skip(skip)
                .limit(reqPageSize ? reqPageSize : this.pageSize)
                .then(this.renderAll(res, next, {
                page,
                count,
                pageSize: reqPageSize ? reqPageSize : this.pageSize,
                url: req.url,
                queryParams: req.query
            })))
                .catch(next);
        };
        this.findById = (req, res, next) => {
            this.prepareOne(this.model.findById(req.params.id))
                .then(this.render(res, next))
                .catch(next);
        };
        this.save = (req, res, next) => {
            let document = new this.model(req.body);
            document
                .save()
                .then(this.render(res, next))
                .catch(next);
        };
        this.replace = (req, res, next) => {
            const options = { overwrite: true, runValidators: true };
            this.model
                .updateOne({ _id: req.params.id }, req.body, options)
                .exec()
                .then(result => {
                if (result.n) {
                    return this.model.findById(req.params.id);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado.');
                }
            })
                .then(document => {
                res.send(document);
                return next();
            })
                .catch(next);
        };
        this.update = (req, res, next) => {
            this.model
                .findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
                .then(document => {
                if (document) {
                    res.send(document);
                    return next();
                }
                throw new restify_errors_1.NotFoundError('Documento não encontrado.');
            })
                .catch(next);
        };
        this.delete = (req, res, next) => {
            this.model
                .findByIdAndRemove({ _id: req.params.id })
                .then(document => {
                if (document) {
                    res.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado.');
                }
                return next();
            })
                .catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    prepareOne(query) {
        return query;
    }
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    envelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: `${options.url}`
            }
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = options.queryParams._pageSize ? `${this.basePath}?_page=${options.page - 1}&_pageSize=${options.queryParams._pageSize}` : `${this.basePath}?_page=${options.page - 1}`;
                resource.previousPage = options.page - 1;
            }
            const remaining = options.count - options.page * options.pageSize;
            if (remaining > 0) {
                resource._links.next = options.queryParams._pageSize ? `${this.basePath}?_page=${options.page + 1}&_pageSize=${options.queryParams._pageSize}` : `${this.basePath}?_page=${options.page + 1}`;
                resource.nextPage = options.page + 1;
            }
            resource.total = options.count;
        }
        resource.data = documents;
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
