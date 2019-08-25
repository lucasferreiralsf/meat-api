import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { environment } from '../common/environments';
import { Router } from '../common/router';
import { mergePatchBodyParser } from './merge-patch.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';

export class Server {
  application: restify.Server;

  initializeDb() {
    return mongoose.connect(environment.db.url, {
      // useMongoClient: true,
      useNewUrlParser: true
    });
  }

  initRoutes(routers: Router[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const options: restify.ServerOptions = {
          name: 'meat-api',
          version: '1.0',
          log: logger
        };

        if (environment.security.enableHttps) {
          options.certificate = environment.security.certificate;
          options.key = environment.security.key;
        }

        this.application = restify.createServer(options);

        this.application.pre(
          restify.plugins.requestLogger({
            log: logger
          })
        );

        this.application.use(restify.plugins.queryParser());
        this.application.use(restify.plugins.bodyParser());
        this.application.use(mergePatchBodyParser);
        this.application.use(tokenParser);

        for (const router of routers) {
          router.applyRoutes(this.application);
        }

        this.application.listen(environment.server.port, () => {
          resolve(this.application);
        });

        this.application.on('restifyError', handleError);
      } catch (error) {
        reject(error);
      }
    });
  }

  bootstrap(routers: Router[] = []): Promise<Server> {
    return this.initializeDb().then(() => this.initRoutes(routers).then(() => this));
  }

  shutdown() {
    return mongoose.disconnect().then(() => this.application.close());
  }
}
