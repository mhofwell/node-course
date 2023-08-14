const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const err = new Error('No Authorization header.');
        err.statusCode = 401;
        throw err;
    }
    // get the authorization header from the client
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const err = new Error('Not Authenticated');
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodedToken.userId;
    next();
};
