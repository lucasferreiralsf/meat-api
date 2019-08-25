import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/users.model';
import { NotAuthorizedError } from 'restify-errors';
import { environment } from '../common/environments';

export const authenticate: restify.RequestHandler = (req, res, next) => {
  const { email, password } = req.body;
  User.findByEmail(email, '+password')
    .then(user => {
      if (user && user.matches(password)) {
        // @ts-ignore
        const token = jwt.sign({sub: user.email, iss: 'meat-api'}, environment.security.apiSecret);
        res.send({name: user.name, email: user.email, token});
        return next(false);
      } else {
        return next(new NotAuthorizedError('Invalid Credentials.'));
      }
    })
    .catch(next);
};
