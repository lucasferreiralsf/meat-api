import { ModelRouter } from '../common/model-router';
import { Review } from './reviews.model';
import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { authorize } from '../security/authz.handler';

class ReviewsRouter extends ModelRouter<Review> {
  constructor() {
    super(Review);
  }

  // findById = (req, res, next) => {
  //   this.model
  //     .findById(req.params.id)
  //     .populate('user', 'name')
  //     .populate('restaurant', 'name')
  //     .then(this.render(res, next))
  //     .catch(next);
  // };

  envelope(document) {
    let resource = super.envelope(document);
    const restId = document.restaurant._id ? document.restaurant._id : document.restaurant;
    resource._links.restaurant = `/restaurants/${restId}`
    return resource;
  }

  protected prepareOne(
    query: mongoose.DocumentQuery<Review, Review>
  ): mongoose.DocumentQuery<Review, Review> {
    return query.populate('user', 'name').populate('restaurant', 'name');
  }

  applyRoutes(application: restify.Server) {
    application.get(`${this.basePath}`, this.findAll);
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
    application.post(`${this.basePath}`, [authorize('user'), this.save]);
    // application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
    // application.patch(`${this.basePath}/:id`, [this.validateId, this.update]);
    // application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
  }
}

export const reviewsRouter = new ReviewsRouter();
