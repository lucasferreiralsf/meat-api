import { ModelRouter } from '../common/model-router';
import { Restaurant } from './restaurants.model';
import * as restify from 'restify';
import { NotFoundError } from 'restify-errors';
import { authorize } from '../security/authz.handler';

class RestaurantsRouter extends ModelRouter<Restaurant> {
  constructor() {
    super(Restaurant);
  }

  envelope(document) {
    let resource = super.envelope(document);
    resource._links.menu = `${this.basePath}/${resource._id}/menu`
    return resource;
  }

  findMenu = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    Restaurant.findById(req.params.id, '+menu')
      .then(rest => {
        if (!rest) {
          next(new NotFoundError('Restaurant not found.'));
        } else {
          res.send(rest.menu);
          return next();
        }
      })
      .catch(next);
  };

  replaceMenu = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    Restaurant.findById(req.params.id)
      .then(rest => {
        if (!rest) {
          next(new NotFoundError('Restaurant not found.'));
        } else {
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

  applyRoutes(application: restify.Server) {
    application.get(`${this.basePath}`, this.findAll);
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
    application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]);
    application.post(`${this.basePath}`, [authorize('admin'), this.save]);
    application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace]);
    application.put(`${this.basePath}/:id/menu`, [authorize('admin'), this.validateId, this.replaceMenu]);
    application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update]);
    application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
  }
}

export const restaurantsRouter = new RestaurantsRouter();
