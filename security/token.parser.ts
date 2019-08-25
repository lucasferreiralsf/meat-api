import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/users.model';
import { environment } from '../common/environments';

export const tokenParser: restify.RequestHandler = (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    jwt.verify(token, environment.security.apiSecret, applyBearer(req, next));
  } else {
    next();
  }
};

function extractToken(req: restify.Request) {
  const auth = req.header('authorization');
  let token = undefined;
  if(auth) {
    const parts: string[] = auth.split(' ');
    if(parts.length === 2 && parts[0] === 'Bearer' ) {
      token = parts[1]
    }
  }
  return token;
}

function applyBearer(req: restify.Request, next): (error, decoded) => void {
  return (error, decoded) => {
    if (decoded) {
      User.findByEmail(decoded.sub).then(user => {
        if(user) {
          // @ts-ignore
          req.authenticated = user;
        }
        next();
      })
    } else {
      next();
    }
  }
}