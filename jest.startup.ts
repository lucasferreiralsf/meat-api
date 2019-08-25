import { environment } from './common/environments';
import { Server } from './server/server';
import { usersRouter } from './users/users.router';
import { User } from './users/users.model';
import { reviewsRouter } from './reviews/reviews.router';
import { Review } from './reviews/reviews.model';
import * as jestCli from 'jest-cli';

let server: Server;
let address: string = 'http://localhost:3001';

const beforeAllTests = () => {
  environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test';
  environment.server.port = process.env.SERVER_PORT || 3001;
  address = `http://localhost:${environment.server.port}`;
  server = new Server();
  return server
    .bootstrap([usersRouter, reviewsRouter])
    .then(() => User.deleteMany({}).exec())
    .then(() => {
      let admin = new User();
      admin.name = 'admin',
      admin.email = 'admin@meat.com',
      admin.password = '123',
      admin.profiles = ['admin', 'user']
      return admin.save();
    })
    .then(() => Review.deleteMany({}).exec());
};
const afterAllTests = () => {
  return server.shutdown();
};

beforeAllTests()
  .then(() => jestCli.run())
  .then(() => afterAllTests())
  .catch(console.error);
