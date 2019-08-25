"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = (req, res, err, done) => {
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
            const messages = [];
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
