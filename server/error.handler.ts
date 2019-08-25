import * as restify from 'restify';

export const handleError = (req: restify.Request, res: restify.Response, err, done) => {
  // err.toJSON = () => {
  //   return {
  //     message: err.message
  //   };
  // };

  // res.send(500, {message: err.message});

  switch (err.name) {
    case 'MongoError':
      if (err.code === 11000) {
        err.statusCode = 400;
      }
      break;
    case 'ValidationError':
      const messages: any[] = [];
      for (const erro in err.errors) {
        if (err.errors.hasOwnProperty(erro)) {
          messages.push({ message: err.errors[erro].message });
        }
      }
      res.send(400, { message: 'Validation error while processing your request.', errors: messages });
      break;
    case 'NotFoundError':
      res.send(404, { message: err.message });
      break;
    case 'ForbiddenError':
      res.send(403, { message: err.message });
      break;

    default:
      res.send(500, { message: err.message });
      break;
  }
  done();
};
